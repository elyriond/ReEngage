import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useMemo } from "react";

import { TemplateDraftHistoryEntry } from "../lib/useTemplateDraftController";

interface TemplateChatPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  history: TemplateDraftHistoryEntry[];
}

export default function TemplateChatPanel({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  history,
}: TemplateChatPanelProps) {
  const theme = useTheme();

  const recentHistory = useMemo(
    () => history.slice(-5).reverse(),
    [history],
  );

  return (
    <Stack
      spacing={2}
      sx={{
        height: "100%",
        border: `1px solid ${theme.palette.grey[200]}`,
        borderRadius: 2,
        padding: 2,
        backgroundColor: theme.palette.grey[50],
        minWidth: 0,
      }}
    >
      <Typography variant="h6">LLM Assistant</Typography>
      <Typography variant="body2" color="text.secondary">
        Chat-driven editing coming soon. Use the preview or MJML tabs to tweak
        the template while we wire up the assistant.
      </Typography>
      <Divider />
      <Stack spacing={1}>
        <Typography variant="subtitle2">Recent changes</Typography>
        {recentHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No applied changes yet. Once edits land, they will show up here.
          </Typography>
        ) : (
          recentHistory.map((entry) => (
            <Box key={entry.timestamp}>
              <Typography variant="body2">
                {entry.description ?? "Manual update applied"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(entry.timestamp).toLocaleTimeString()} · {entry.source}
              </Typography>
            </Box>
          ))
        )}
      </Stack>
      <Divider />
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onRedo}
          disabled={!canRedo}
        >
          Redo
        </Button>
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="contained" color="primary" disabled>
        Send Prompt
      </Button>
    </Stack>
  );
}
