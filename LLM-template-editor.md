# LLM-Powered Template Editor Hackathon Plan

## Context
- Hackathon prototype for a single fashion retail client.
- Goal: showcase a Lovable-style chat interface that generates and edits MJML email templates with tone and brand awareness.
- First demo template: basket reminder email that enriches content via a similar-items recommender API (IDs supplied later).

## Current Editor Recon
- Locate existing React editor components under `dittofeed/packages/dashboard`; document what handles MJML editing, preview, and persistence.
- Trace MJML compilation pipeline and any server APIs the current editor calls.
- Identify storage location for templates and metadata to know what needs replacing vs. reusing.

## Target UX Definition
- Design a chat-first workspace: conversation pane, message composer, live MJML preview, tone controls, brand sidebar, undo/redo surface.
- Script the basket reminder journey (inputs: cart item details, recommender response placeholders).
- Produce quick wireframes/storyboards so stakeholders align on interactions before implementation.

## Backend Scaffolding
- Expose a chat session endpoint that pulls single-client brand config, calls OpenAI with structured prompts, and streams MJML/code suggestions.
- Persist conversation turns and template revisions (lightweight table or in-memory store with disk backup for demo reliability).
- Provide simple endpoints for saving/publishing final MJML and for fetching recommender data preview mocks.

## Prompt & Validation Layer
- Draft system prompts covering brand tone, fashion context, MJML constraints, and safe completion rules.
- Implement prompt variants for actions: initial draft, tone refinement, structural tweaks, inserting dynamic blocks (e.g., recommender section).
- Add MJML validation pass; on failure, surface error and request auto-repair from the model when feasible.

## Brand Context Ingestion
- Build a one-time scraper for the client’s website to extract palette, typography hints, and logo asset; allow manual overrides in UI.
- Cache parsed brand attributes so they can be injected into prompts and preview styling.
- Prepare tone-of-voice presets (e.g., “luxury”, “streetwear”) to feed both prompts and UI controls.

## Image-to-MJML Demo Path
- Accept optional design image upload; call vision model to describe layout.
- Translate detected sections into heuristic MJML blocks (hero image, product grid, CTA).
- Curate a sample asset to ensure the flow succeeds during the live demo.

## Recommender Integration
- Define data contract for the recommender API (input cart item ID → similar item IDs + metadata).
- Embed merge tags/placeholders inside generated MJML for recommender-driven content.
- Provide mock API response for previewing inside the editor without live backend dependency.

## Frontend Implementation
- Replace the legacy editor view with the chat UI: streamed responses, selectable prompt presets, and a live MJML preview panel.
- Include a manual MJML code toggle for credibility and emergency edits.
- Surface brand controls (tone slider, palette preview) and revision history snapshots.

## Template Editor Architecture Draft
- **Layout Shell**: Retain `TemplateEditor` as the state holder, but swap the 50/50 split for a three-mode workspace. Left column hosts the LLM chat + prompt presets; right column exposes a tab group (`Preview`, `MJML`, later `Diff`). The user-properties sidebar stays collapsible and defaults to minimized for screen real estate.
- **Chat Panel**: New `TemplateChatPanel` component streams messages, shows applied changes history, and offers quick actions (tone presets, “Fix validation errors”). Each applied turn emits a `TemplateDraftPatch` event consumed by `TemplateEditor`.
- **Quick-Tweak Controls**: Within the `Preview` tab, render contextual edit handles (subject line, CTA text, primary color chips). Edits call `onPartialUpdate` which mutates the draft and logs a chat-side system notice (“User tweaked CTA label → Shop Now”).
- **Code Tab Reuse**: Embed the existing `CodeEmailBodyEditor` inside the `MJML` tab so power users keep raw control. Changes propagate through the shared `setDraft` pipeline and trigger live preview refresh plus chat log annotation.
- **State Sync**: Centralize draft updates via a new hook (e.g., `useTemplateDraftController`) that accepts patches from chat, quick tweaks, or manual code edits, deduplicates validation runs, and feeds `useRenderTemplateQuery`.
- **History & Undo**: Maintain a ring buffer of applied patches (chat or manual) allowing a lightweight undo/redo surfaced near the chat composer.
- **Broadcast Compatibility**: `TemplateEditor` exposes props to hide chat or tabs if another consumer (e.g., SMS/webhook) lacks MJML; defaults keep Broadcast flows intact while the email channel gets the full chat experience.

## Data Flow & State Notes
- **Draft Source of Truth**: `TemplateEditor` continues to own `editedTemplate.draft`. Introduce a reducer-style `dispatchDraftPatch(patch)` that all inputs (chat, quick tweaks, code editor) call. Patch shape mirrors the backend `MessageTemplateResourceDraft` diff (e.g., `{ body, subject }`).
- **Chat Interaction Loop**:
  1. User sends prompt → `TemplateChatPanel` posts to `/api/template-chat` with current draft snapshot, brand config, tone settings.
  2. API streams back steps (`analysis`, `mjml_patch`, `summary`). The panel buffers the patch payload.
  3. On user approval (“Apply change”), the panel calls `dispatchDraftPatch` and appends a system message describing the applied diff. Decline/Undo simply discard or reverse the patch.
- **Manual Edits**: `CodeEmailBodyEditor` and inline preview controls call `dispatchDraftPatch` immediately with `{ body: newValue }`. The controller debounces compile requests and pushes a “Manual edit” event onto the chat timeline for context continuity.
- **Rendering**: `useTemplateDraftController` triggers `useRenderTemplateQuery` whenever the debounced draft hash changes. Render errors are piped back to the controller, which surfaces them in the chat (auto-suggest “ask AI to fix”) and in the preview.
- **Version History**: Each applied patch is logged with metadata (`source: chat | manual`, `timestamp`, `delta`). Undo walks this stack backward, re-emitting the inverse patch through the same controller so all subscribers stay in sync.
- **Broadcast Hook**: When `TemplateEditor` runs inside broadcasts, it passes `enableChat=false` so the chat panel hides, but the same controller handles manual/preview edits. This keeps state management consistent across contexts.

## Implementation Roadmap
1. **Scaffold State Controller**
   - Add `useTemplateDraftController` hook managing `dispatchDraftPatch`, change history, and render debouncing.
   - Wire controller into existing `TemplateEditor` state (`templateEditor.tsx`) and update callers (`emailEditor.tsx`, broadcast content).
2. **Embed Chat Workspace**
   - Create `TemplateChatPanel` with message list, composer, quick actions, and streaming support using the OpenAI key.
   - Define API contract for `/api/template-chat` (mock initially) and integrate approval/apply UX.
3. **Refactor Layout & Tabs**
   - Replace the code/preview split with MUI Tabs (`Preview`, `MJML`, `Diff` placeholder).
   - Move `CodeEmailBodyEditor` under `MJML` tab; introduce `PreviewQuickTweaks` component within `Preview`.
4. **Quick-Tweak Controls**
   - Implement inline editors for subject, preheader, CTA text, and palette chips in preview mode.
   - Emit structured patches + chat timeline annotations on change.
5. **Chat-to-Draft Pipeline**
   - Implement backend handler that builds prompts, calls OpenAI, validates MJML, and returns patch + rationale + fallback instructions.
   - Add error handling paths and “Fix with AI” shortcut when validation fails.
6. **Recommender Block Support**
   - Stub API client that fetches similar-item IDs (mock data until real endpoint ready).
   - Provide chat tool/function for inserting recommender MJML snippet with merge tags.
7. **Demo Polishing**
   - Seed initial conversation and template state, ensure undo/redo works, and document walkthrough steps.

## Current Progress
- Converted `TemplateEditor` to the new chat-aware shell: chat column + Preview/MJML tabs gated by `enableChatMode`, while keeping fullscreen/dialog behaviour intact.
- Added `useTemplateDraftController` hook with undo/redo history so future chat, quick tweaks, and manual MJML edits share a single patch pipeline.
- Dropped in a placeholder `TemplateChatPanel` surfacing undo/redo controls and recent change history; ready to swap for the live LLM chat UI.
- Enabled the new layout for email templates via `enableChatMode` in `emailEditor.tsx`; other channels remain on the legacy split view.
- Updated the working dev setup guidance (switch Yarn to `node-modules`, handle Corepack permissions) to unblock local testing on port 3001.
- Next up: wire the OpenAI-backed `/template-chat` endpoint, stream responses into the panel, and introduce quick-tweak controls inside the Preview tab.

## Demo Preparation
- Seed an example conversation that walks through generating and refining the basket reminder email.
- Preload recommender mock data and confirm preview renders cleanly.
- Document talking points on future roadmap (multi-client support, richer analytics, production hardening) to frame the prototype’s potential.
