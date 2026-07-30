import { notFound } from "next/navigation";
import { getHost } from "@/lib/inventory";
import { VmDetail } from "@/components/infra/vm-detail";

export default async function VmDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  if (!getHost(name)) notFound();
  return <VmDetail name={name} />;
}
