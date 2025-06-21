import React, {useState} from 'react';
import { Link, useParams} from 'react-router-dom';
import {
  FaBars,
  FaHome,
  FaUsers,
  FaClipboardList,
  FaFileAlt,
  FaEnvelope,
  FaFolder,
  FaProjectDiagram,
  FaDatabase,
  FaCubes,
  FaLayerGroup,
  FaEye,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa"

function BayerBim360Sidebar() {
  const { projectId, accountId } = useParams()

  const [isCollapsed, setIsCollapsed] = useState(true)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Categories
  const overviewItems = [
    { to: "/bim360/projects", icon: FaHome, label: "Projects Page" },
    {
      to: `/bim360/projects/${accountId}/${projectId}`,
      icon: FaProjectDiagram,
      label: "Project Overview",
    },
  ]
  const reportsItems = [
    {
      to: `/bim360/projects/${accountId}/${projectId}/users`,
      icon: FaUsers,
      label: "Users Report",
    },
    {
      to: `/bim360/projects/${accountId}/${projectId}/issues`,
      icon: FaClipboardList,
      label: "Issues Report",
    },
    {
      to: `/bim360/projects/${accountId}/${projectId}/rfis`,
      icon: FaEnvelope,
      label: "RFI Report",
    },
  ]
  const foldersAndFilesItems = [
    {
      to: `/bim360/projects/${accountId}/${projectId}/folder-permits`,
      icon: FaFolder,
      label: "Folder Permits",
    },
  ]
  const databaseItems = [
    {
      to: `/bim360/projects/${accountId}/${projectId}/model-database`,
      icon: FaCubes,
      label: "Model Database",
    },
    {
      to: `/bim360/projects/${accountId}/${projectId}/digital-twin`,
      icon: FaDatabase,
      label: "Digital Twin",
    },
  ]

  const handleToggleDesktop = () => {
    setIsCollapsed(!isCollapsed)
  }
  const handleToggleMobile = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  const handleNavigation = () => {
    setIsMobileMenuOpen(false)
  }

  // Sidebar width on desktop
  const sidebarWidth = isCollapsed ? "w-16" : "w-64"

  return (
    <>
      {/* Hamburger button (mobile only) */}
      <button
        onClick={handleToggleMobile}
        className="lg:hidden absolute top-4 left-4 z-30 p-2 rounded-lg bg-black text-white"
      >
        <FaBars className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={handleToggleMobile}
        />
      )}

      <div
        className={`
          ${sidebarWidth}
          min-h-screen         
          bg-gray-700
          text-white
          border-r border-gray-300
          flex flex-col
          transition-all duration-300
          top-0 left-0
          z-30
          
          ${isMobileMenuOpen ? "absolute translate-x-0" : "absolute -translate-x-full lg:translate-x-0 lg:static"}
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {/* Title (visible only when expanded) */}
          {!isCollapsed && (
            <h2 className="text-sm font-bold whitespace-nowrap">BAYER BIM CONNECT</h2>
          )}

          {/* Chevron button collapse/expand */}
          <button
            onClick={handleToggleDesktop}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
          >
            {isCollapsed ? (
              <FaChevronRight className="h-5 w-5" />
            ) : (
              <FaChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* SCROLL CONTENT */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarCategory
            isCollapsed={isCollapsed}
            title="Overview"
            items={overviewItems}
            onLinkClick={handleNavigation}
          />
          <SidebarCategory
            isCollapsed={isCollapsed}
            title="Reports"
            items={reportsItems}
            onLinkClick={handleNavigation}
          />
          <SidebarCategory
            isCollapsed={isCollapsed}
            title="Folders & Files"
            items={foldersAndFilesItems}
            onLinkClick={handleNavigation}
          />
          <SidebarCategory
            isCollapsed={isCollapsed}
            title="Database"
            items={databaseItems}
            onLinkClick={handleNavigation}
          />
        </div>

        {/* FOOTER */}
        <div className="px-4 py-4 border-t border-gray-800">
          {!isCollapsed && (
            <p className="text-xs text-gray-400">© 2025 BAYER</p>
          )}
        </div>
      </div>
    </>
  )
}

/** Sidebar section: Title + Item list */
function SidebarCategory({ isCollapsed, title, items, onLinkClick }) {
  return (
    <div className="mb-6">
      {!isCollapsed && (
        <h2 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </h2>
      )}
      <div className="space-y-1 px-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavItem
            key={label}
            to={to}
            icon={Icon}
            label={!isCollapsed ? label : ""}
            onClick={onLinkClick}
          />
        ))}
      </div>
    </div>
  )
}

/** Menu item */
function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="
        group 
        flex items-center 
        px-3 py-2 
        rounded-md
        transition-colors 
        text-white
        hover:text-gray-200 hover:bg-gray-800
        relative
        text-xs
      "
    >
      <Icon className="h-3 w-3 mr-3 flex-shrink-0" />
      {label}
    </Link>
  )
}

export default BayerBim360Sidebar;
