import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nodebase Docs — Interactive Documentation",
  description:
    "Comprehensive documentation for Nodebase workflow automation platform. Learn about triggers, nodes, credentials, executions and more.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
