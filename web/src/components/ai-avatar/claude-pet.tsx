/**
 * Claude 机甲虎吉祥物 · 木偶式动画 sprite
 * ---------------------------------------------------------------
 * 纯展示组件：根据 state 切换 CSS 动画类。
 * 素材是用户提供的角色原画（已抠透明），整体 squash & stretch + 浮动 + 影子联动。
 * 动画定义在 globals.css 的 .claude-pet 区块。
 * 状态：idle 待机 / hello 打招呼 / talk 说话 / think 思考 / sleep 睡觉 / error 出错
 */

export type PetState = "idle" | "hello" | "talk" | "think" | "sleep" | "error";

export default function ClaudePet({
  state = "idle",
  className = "",
}: {
  state?: PetState;
  className?: string;
}) {
  return (
    <span className={`claude-pet state-${state} ${className}`} aria-hidden>
      <span className="claude-pet-shadow" />
      {/* 装饰性 sprite，alt 留空（外层按钮已有 aria-label） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="claude-pet-sprite"
        src="/claude-pet.png"
        alt=""
        draggable={false}
      />
    </span>
  );
}
