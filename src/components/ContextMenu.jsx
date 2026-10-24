import { useState, useRef, useEffect } from "react";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { sx, utilities } from "@fraserelliott/fe-utilities";

export default function ContextMenu({ children, items }) {
  const [contextMenu, setContextMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!contextMenu) return;

    const handleOutsideClick = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setContextMenu(null);
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setContextMenu(null);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu({
          x: e.clientX,
          y: e.clientY,
        });
      }}
    >
      {children}
      {contextMenu && items && (
        <div
          ref={menuRef}
          style={sx(
            feSlateStyles.BGDropdown,
            utilities["fe-d-flex"],
            utilities["fe-flex-column"],
            {
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 1000,
              border: "1px solid rgba(59, 130, 246, 0.8)",
            },
          )}
        >
          {items.map((item) => (
            <span
              key={item.label}
              onClick={() => {
                item.onClick?.();
                setContextMenu(null);
              }}
              style={{ padding: "0.5em" }}
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
