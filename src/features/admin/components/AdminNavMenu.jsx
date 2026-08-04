import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import MaterialIcon from '../../../components/common/MaterialIcon'
import {
  ADMIN_SIDEBAR_SECTIONS,
  isAdminNavItemActive,
  isAdminSectionActive,
} from '../constants/adminNavItems'

function linkClass(isActive, nested = false) {
  return [
    'flex items-center gap-3 rounded-xl text-sm font-medium transition-colors',
    nested ? 'px-3 py-2.5' : 'px-4 py-3',
    isActive
      ? 'bg-primary text-on-primary shadow-[0_8px_20px_rgba(74,48,32,0.16)]'
      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary',
  ].join(' ')
}

function NavItemLink({ item, nested = false, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={Boolean(item.end)}
      onClick={onNavigate}
      className={({ isActive }) => linkClass(isActive, nested)}
    >
      <MaterialIcon name={item.icon} className={nested ? 'text-[1.15rem]' : 'text-[1.25rem]'} />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

function AccordionGroup({ section, open, onToggle, onNavigate }) {
  const location = useLocation()
  const sectionActive = isAdminSectionActive(location.pathname, section)

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={[
          'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors',
          sectionActive && !open
            ? 'bg-primary/10 text-primary'
            : 'text-on-surface hover:bg-surface-container-low hover:text-primary',
        ].join(' ')}
      >
        <MaterialIcon name={section.icon} className="text-[1.25rem]" />
        <span className="min-w-0 flex-1 truncate">{section.label}</span>
        <MaterialIcon
          name="expand_more"
          className={[
            'text-[1.25rem] text-outline transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      <div
        className={[
          'grid transition-[grid-template-rows] duration-200 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="ml-3 space-y-0.5 border-l border-outline-variant/25 py-0.5 pl-3">
            {section.children.map((item) => (
              <NavItemLink key={item.to} item={item} nested onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkSection({ section, onNavigate }) {
  return (
    <div className="space-y-1.5">
      <p className="px-4 text-[10px] font-semibold tracking-[0.14em] text-outline uppercase">
        {section.label}
      </p>
      <NavItemLink item={section.item} onNavigate={onNavigate} />
    </div>
  )
}

/** Menu sidebar/drawer dạng nhóm accordion */
function AdminNavMenu({ onNavigate, className = '' }) {
  const location = useLocation()
  const [openIds, setOpenIds] = useState(() =>
    ADMIN_SIDEBAR_SECTIONS.filter(
      (section) =>
        section.type === 'group' && isAdminSectionActive(location.pathname, section),
    ).map((section) => section.id),
  )

  useEffect(() => {
    const activeGroupIds = ADMIN_SIDEBAR_SECTIONS.filter(
      (section) =>
        section.type === 'group' && isAdminSectionActive(location.pathname, section),
    ).map((section) => section.id)

    if (activeGroupIds.length === 0) return
    setOpenIds((previous) => [...new Set([...previous, ...activeGroupIds])])
  }, [location.pathname])

  function toggleGroup(id) {
    setOpenIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  return (
    <nav className={['flex flex-1 flex-col gap-3 overflow-y-auto p-4', className].join(' ')}>
      {ADMIN_SIDEBAR_SECTIONS.map((section) => {
        if (section.type === 'link') {
          return <LinkSection key={section.id} section={section} onNavigate={onNavigate} />
        }

        return (
          <AccordionGroup
            key={section.id}
            section={section}
            open={openIds.includes(section.id)}
            onToggle={() => toggleGroup(section.id)}
            onNavigate={onNavigate}
          />
        )
      })}
    </nav>
  )
}

export default AdminNavMenu
export { isAdminNavItemActive }
