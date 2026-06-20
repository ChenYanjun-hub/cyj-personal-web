/**
 * TypeScript 类型声明 · reactbits.dev 第三方 .jsx 组件
 * ---------------------------------------------------------------
 * 这些组件由 `npx jsrepo add` 从 reactbits.dev 拉取，源码是 .jsx（无 TS 类型）。
 * tsc 从 JSDoc 推导时把所有 props 都看作 required，但实际上很多 props 在组件
 * 内部有 default 值（是可选的）。
 *
 * 设计：不动 .jsx 原文件以保持 jsrepo 同步能力，类型在这里独立声明。
 * 未来新增其他 reactbits 组件，按同样模式 declare module 加到这里。
 */

declare module "@/components/reactbits/ProfileCard" {
  import type { ComponentType } from "react";

  export type ProfileCardProps = {
    avatarUrl?: string;
    iconUrl?: string;
    grainUrl?: string;
    innerGradient?: string;
    behindGlowEnabled?: boolean;
    behindGlowColor?: string;
    behindGlowSize?: string;
    className?: string;
    enableTilt?: boolean;
    enableMobileTilt?: boolean;
    mobileTiltSensitivity?: number;
    miniAvatarUrl?: string;
    name?: string;
    title?: string;
    handle?: string;
    status?: string;
    contactText?: string;
    showUserInfo?: boolean;
    onContactClick?: () => void;
  };

  const ProfileCard: ComponentType<ProfileCardProps>;
  export default ProfileCard;
}

declare module "@/components/reactbits/PixelBlast" {
  import type { ComponentType, CSSProperties } from "react";

  export type PixelBlastProps = {
    variant?: "square" | "circle" | "triangle" | "diamond";
    pixelSize?: number;
    color?: string;
    antialias?: boolean;
    patternScale?: number;
    patternDensity?: number;
    liquid?: boolean;
    liquidStrength?: number;
    liquidRadius?: number;
    pixelSizeJitter?: number;
    enableRipples?: boolean;
    rippleIntensityScale?: number;
    rippleThickness?: number;
    rippleSpeed?: number;
    liquidWobbleSpeed?: number;
    autoPauseOffscreen?: boolean;
    speed?: number;
    transparent?: boolean;
    edgeFade?: number;
    noiseAmount?: number;
    className?: string;
    style?: CSSProperties;
  };

  const PixelBlast: ComponentType<PixelBlastProps>;
  export default PixelBlast;
}
