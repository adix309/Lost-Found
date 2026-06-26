"use client";

import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { useI18n } from "@/components/i18n/I18nProvider";

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Tooltip title={t("nav.language")}>
      <FormControl size="small" sx={{ minWidth: 88 }}>
        <Select
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
          inputProps={{ "aria-label": t("nav.language") }}
          sx={{
            height: 36,
            borderRadius: 2,
            bgcolor: "grey.100",
            fontWeight: 700,
            fontSize: "0.8rem",
            "& .MuiSelect-select": {
              py: 0.8,
            },
          }}
        >
          {locales.map((entry) => (
            <MenuItem key={entry} value={entry}>
              {entry.toUpperCase()} · {localeLabels[entry]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  );
}
