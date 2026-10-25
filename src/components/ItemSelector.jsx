import { useState, useRef, useEffect } from "react";
import { useFEStyles, ActionList } from "@fraserelliott/fe-components";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { sx, utilities } from "@fraserelliott/fe-utilities";

export default function ItemSelector({
  selectedIds = [],
  allItems = [],
  onChange,
  buttonText = "Select Items",
  searchPlaceholder = "Search for item",
  onCreate,
  showUnusedItems = false,
  getUsageCount,
  renderAbove = false,
  disableRow = () => false,
}) {
  const { styleComponent } = useFEStyles();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const toggleButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target)
      ) {
        setOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const normalise = (s) => s.trim().toLowerCase();
  const isSelected = (item) => selectedIds.some((v) => v === item.id);
  const toggleItem = (item, newValue) => onChange?.(item, newValue);

  // TODO: tag and category usage count
  const filtered = allItems
    .filter(
      (item) =>
        showUnusedItems || !getUsageCount || (getUsageCount(item) ?? 0) > 0,
    )
    .filter((item) => normalise(item.name).includes(normalise(searchTerm)));

  const exactMatchExists = allItems.some(
    (item) => normalise(item.name) === normalise(searchTerm),
  );

  const renderItemRow = (item) => (
    <div
      style={sx(
        utilities["fe-d-flex"],
        utilities["fe-gap-1"],
        utilities["fe-items-center"],
      )}
    >
      <label style={sx(disableRow(item) && feSlateStyles.TextMuted)}>
        <input
          type="checkbox"
          checked={isSelected(item)}
          onChange={(e) => {
            toggleItem(item, !isSelected(item));
          }}
          disabled={disableRow(item)}
        />
        {item.name}
      </label>
    </div>
  );

  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
      }}
    >
      <button
        type="button"
        ref={toggleButtonRef}
        onClick={() => setOpen((v) => !v)}
        {...styleComponent("BtnPrimary", { whiteSpace: "nowrap" })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        {buttonText}
      </button>

      {open && (
        <div
          style={sx(feSlateStyles.BGDropdown, {
            position: "absolute",
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
            ...(renderAbove ? { bottom: "2.8rem" } : { top: "2.8rem" }),
            right: "10px",
            whiteSpace: "nowrap",
            zIndex: "100",
            padding: "4px",
          })}
          ref={dropdownRef}
        >
          <input
            type="text"
            placeholder={searchPlaceholder}
            {...styleComponent("InputPrimary")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ActionList
            items={filtered}
            getKey={(item) => item.name}
            renderItem={renderItemRow}
          />
          {onCreate && searchTerm.trim() && !exactMatchExists && (
            <ul style={{ listStyle: "none" }}>
              <li
                style={{ fontStyle: "italic" }}
                onClick={() => onCreate(searchTerm.trim())}
              >
                {searchTerm.trim()} (create)
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
