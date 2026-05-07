interface StatusBarProps {
  /** 状态栏背景色 */
  bgColor?: string
  /** 状态栏文字/图标颜色 */
  textColor?: string
}

/**
 * 移动端模拟状态栏（通知栏）
 * 作用于 preview layout 层，默认显示，可在设置/菜单中切换隐藏。
 */
export function StatusBar({ bgColor = '#000', textColor = '#fff' }: StatusBarProps) {
  return (
    <div
      className="flex items-center justify-between px-6 py-2 text-[11px] font-semibold"
      style={{ color: textColor, backgroundColor: bgColor }}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1">
        {/* 信号图标 */}
        <svg className="h-3 w-4" viewBox="0 0 16 12" fill="currentColor">
          <path d="M1 9h2V5H1v4zm3 2h2V3H4v8zm3-4h2V1H7v6zm3 2h2V5h-2v4z" />
        </svg>
        {/* 电池图标 */}
        <svg className="h-3 w-4" viewBox="0 0 16 12" fill="currentColor">
          <path d="M11 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        </svg>
      </div>
    </div>
  )
}
