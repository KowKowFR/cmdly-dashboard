import { cn } from "@/lib/utils";
import type { Zone } from "@/lib/inventory";

const ZONE_TEXT: Record<Zone, string> = {
  DMZ: "text-zone-dmz",
  SRV: "text-zone-srv",
  MGT: "text-zone-mgt",
  OVH: "text-zone-ovh",
};

export function ZoneTag({ zone }: { zone: Zone }) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-medium uppercase tracking-wider",
        ZONE_TEXT[zone],
      )}
    >
      {zone}
    </span>
  );
}
