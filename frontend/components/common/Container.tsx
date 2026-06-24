import type { ReactNode } from "react";
import MuiContainer from "@mui/material/Container";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: ContainerProps) {
  return (
    <MuiContainer maxWidth="lg" className={className} sx={{ px: 3 }}>
      {children}
    </MuiContainer>
  );
}
