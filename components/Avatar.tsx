import { TEAM } from "@/lib/constants";

interface AvatarProps {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  index?: number;
  border?: string;
}

const sizes = {
  sm: "w-[17px] h-[17px] text-[9px] border-[1.5px]",
  md: "w-[26px] h-[26px] text-[11px] border-2",
  lg: "w-9 h-9 text-sm border-2",
};

export function Avatar({
  name,
  color,
  size = "md",
  index = 0,
  border = "border-white",
}: AvatarProps) {
  return (
    <div
      title={name}
      className={`${sizes[size]} ${border} rounded-full flex items-center justify-center font-bold text-white shrink-0 relative`}
      style={{
        background: color,
        marginLeft: index > 0 ? (size === "sm" ? "-5px" : "-8px") : 0,
        zIndex: 10 - index,
      }}
    >
      {name[0]}
    </div>
  );
}

export function MemberAvatars({
  memberIds,
  size = "md",
}: {
  memberIds: string[];
  size?: "sm" | "md";
}) {
  const members = memberIds
    .map((id) => TEAM.find((t) => t.id === id))
    .filter(Boolean) as (typeof TEAM)[number][];

  if (!members.length) return null;

  return (
    <div className="flex items-center shrink-0">
      {members.map((m, i) => (
        <Avatar key={m.id} name={m.name} color={m.color} size={size} index={i} />
      ))}
    </div>
  );
}
