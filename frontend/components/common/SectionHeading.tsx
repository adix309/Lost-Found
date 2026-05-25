import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

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
    <div className={styles["section-heading"]}>
      <div>
        <p className={styles["section-heading__eyebrow"]}>{title}</p>
        {description ? (
          <h2 className={styles["section-heading__title"]}>{description}</h2>
        ) : null}
      </div>
      {action ? (
        <div className={styles["section-heading__action"]}>{action}</div>
      ) : null}
    </div>
  );
}
