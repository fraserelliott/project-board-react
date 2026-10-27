import { useProject } from "@/contexts/ProjectContext";
import { NavLink } from "react-router-dom";
import { useFEStyles } from "@fraserelliott/fe-components";
import { feSlateStyles } from "@fraserelliott/fe-slate";
import { sx } from "@fraserelliott/fe-utilities";

export default function Header() {
  const { project, loading, error } = useProject();
  const { styleComponent } = useFEStyles();

  const navLinks = [
    { to: "/", label: "Projects" },
    ...(project
      ? [
          { to: `/project/${project.id}`, label: project.name },
          { to: "/tags", label: "Tags" },
        ]
      : []),
  ];

  const renderPageLink = (page) => {
    const navItemStyles = styleComponent("NavItem");

    return (
      <li key={page.label}>
        <NavLink
          style={({ isActive }) =>
            sx(navItemStyles.style, isActive && feSlateStyles.BtnPrimary)
          }
          to={page.to}
          className={navItemStyles.className}
        >
          {page.label}
        </NavLink>
      </li>
    );
  };

  return (
    <ul {...styleComponent("Navbar")}>
      {navLinks.map((page) => renderPageLink(page))}
    </ul>
  );
}
