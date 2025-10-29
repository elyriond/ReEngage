import { useCallback, useMemo, useRef, useState } from "react";
import { MessageTemplateResourceDraft } from "isomorphic-lib/src/types";

export type DraftUpdateFn = (
  updater: (draft: MessageTemplateResourceDraft) => MessageTemplateResourceDraft,
) => void;

export type TemplateDraftChangeSource = "chat" | "manual" | "quick-tweak" | "system";

export interface TemplateDraftPatch {
  changes: Partial<MessageTemplateResourceDraft>;
  description?: string;
  source: TemplateDraftChangeSource;
}

export interface TemplateDraftHistoryEntry {
  draft: MessageTemplateResourceDraft;
  description?: string;
  source: TemplateDraftChangeSource;
  timestamp: number;
}

export interface TemplateDraftController {
  dispatchDraftPatch: (patch: TemplateDraftPatch) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: TemplateDraftHistoryEntry[];
}

export interface UseTemplateDraftControllerArgs {
  draft: MessageTemplateResourceDraft | null;
  setDraft: DraftUpdateFn | null;
  enabled: boolean;
}

function cloneDraft(draft: MessageTemplateResourceDraft): MessageTemplateResourceDraft {
  return JSON.parse(JSON.stringify(draft)) as MessageTemplateResourceDraft;
}

export function useTemplateDraftController({
  draft,
  setDraft,
  enabled,
}: UseTemplateDraftControllerArgs): TemplateDraftController {
  const historyRef = useRef<{
    past: TemplateDraftHistoryEntry[];
    future: TemplateDraftHistoryEntry[];
  }>({
    past: [],
    future: [],
  });
  const [historyVersion, setHistoryVersion] = useState(0);

  const notifyHistoryChange = useCallback(() => {
    setHistoryVersion((version) => version + 1);
  }, []);

  const dispatchDraftPatch = useCallback(
    (patch: TemplateDraftPatch) => {
      if (!enabled || !draft || !setDraft || !patch.changes) {
        return;
      }
      const snapshot = cloneDraft(draft);
      historyRef.current.past.push({
        draft: snapshot,
        description: patch.description,
        source: patch.source,
        timestamp: Date.now(),
      });
      historyRef.current.future = [];

      setDraft((currentDraft) => {
        const baseDraft = currentDraft
          ? (cloneDraft(currentDraft) as MessageTemplateResourceDraft)
          : ({} as MessageTemplateResourceDraft);
        Object.assign(baseDraft, patch.changes);
        return baseDraft;
      });
      notifyHistoryChange();
    },
    [draft, enabled, notifyHistoryChange, setDraft],
  );

  const undo = useCallback(() => {
    if (!enabled || !setDraft) {
      return;
    }
    const entry = historyRef.current.past.pop();
    if (!entry) {
      return;
    }
    if (draft) {
      historyRef.current.future.push({
        draft: cloneDraft(draft),
        description: entry.description,
        source: entry.source,
        timestamp: Date.now(),
      });
    }
    setDraft(() => cloneDraft(entry.draft));
    notifyHistoryChange();
  }, [draft, enabled, notifyHistoryChange, setDraft]);

  const redo = useCallback(() => {
    if (!enabled || !setDraft) {
      return;
    }
    const entry = historyRef.current.future.pop();
    if (!entry) {
      return;
    }
    if (draft) {
      historyRef.current.past.push({
        draft: cloneDraft(draft),
        description: entry.description,
        source: entry.source,
        timestamp: Date.now(),
      });
    }
    setDraft(() => cloneDraft(entry.draft));
    notifyHistoryChange();
  }, [draft, enabled, notifyHistoryChange, setDraft]);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  const history = useMemo(
    () => [...historyRef.current.past],
    [historyVersion],
  );

  return {
    dispatchDraftPatch,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
  };
}
