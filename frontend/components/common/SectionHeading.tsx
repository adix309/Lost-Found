import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

type SectionHeadingProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeading({
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ mb: 4, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            letterSpacing: "0.1em",
            display: "block",
            lineHeight: 1.5,
          }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              mt: 0.5,
            }}
          >
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  );
}
