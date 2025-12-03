import { StackHandler } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

export const dynamic = "force-dynamic";

export default function Handler(props: { params: Promise<{ stack: string[] }> }) {
  return <StackHandler app={stackClientApp} fullPage {...props} />;
}
