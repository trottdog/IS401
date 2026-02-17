import { useNavigate } from "react-router-dom";
import Colors from "@/constants/colors";

interface PageHeaderProps {
  title: string;
  /** If set, back button goes to this path. Otherwise uses navigate(-1). */
  backTo?: string;
}

export default function PageHeader({ title, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo !== undefined && backTo !== "") navigate(backTo);
    else navigate(-1);
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 0 14px",
        marginBottom: 8,
        borderBottom: `1px solid ${Colors.light.border}`,
      }}
    >
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          padding: 0,
          margin: 0,
          border: "none",
          background: "transparent",
          borderRadius: 12,
          color: Colors.light.tint,
          cursor: "pointer",
        }}
      >
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600, color: Colors.light.text, flex: 1 }}>
        {title}
      </h1>
    </header>
  );
}
