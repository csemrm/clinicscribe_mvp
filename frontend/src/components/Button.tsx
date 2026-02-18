export function Button({
  children, onClick, type='button', variant='primary', disabled=false
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button'|'submit'
  variant?: 'primary'|'secondary'|'danger'
  disabled?: boolean
}) {
  const base = "rounded-md px-3 py-2 text-sm font-medium"
  const styles = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "border bg-white hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  }[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${disabled ? 'opacity-50 cursor-not-allowed':''}`}>
      {children}
    </button>
  )
}
