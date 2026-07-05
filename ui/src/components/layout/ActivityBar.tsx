import { Link } from 'react-router-dom';
import { shellSections, type ShellSectionId } from '@/config/design-system';

type ActivityBarProps = {
  activeSection: ShellSectionId;
};

const sectionIcons: Record<ShellSectionId, JSX.Element> = {
  plugins: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 5h8a3 3 0 0 1 3 3v2h-2V8a1 1 0 0 0-1-1H6z" fill="currentColor" />
      <path d="M6 11h9a3 3 0 0 1 3 3v5H8a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.5 12.5h4.5v4.5h-4.5z" fill="currentColor" opacity="0.8" />
    </svg>
  ),
  workspaces: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9h8M8 12h8M8 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 7h14M5 12h10M5 17h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm7.2 3.8-.98-.56.03-1.14a1 1 0 0 0-.46-.85l-.9-.6a1 1 0 0 0-1-.06l-1 .5-.98-.63-.08-1.12a1 1 0 0 0-.68-.85l-1.1-.37a1 1 0 0 0-1.1.37l-.69.9-1.13-.03-.83-.8a1 1 0 0 0-1.11-.17l-1 .5a1 1 0 0 0-.53.91l.08 1.13-.9.69a1 1 0 0 0-.38 1.02l.17 1.1a1 1 0 0 0 .78.8l1.08.24.5 1-.47.99a1 1 0 0 0 .2 1.1l.8.81a1 1 0 0 0 1.06.2l1-.48 1 .47.24 1.1a1 1 0 0 0 .8.78l1.1.18a1 1 0 0 0 1.02-.38l.69-.9 1.13.08a1 1 0 0 0 .91-.53l.5-1a1 1 0 0 0-.17-1.12l-.8-.83.03-1.13.9-.68a1 1 0 0 0 .37-1.1l-.37-1.1a1 1 0 0 0-.84-.68l-1.13-.08-.63-.98.5-1a1 1 0 0 0-.06-1l-.6-.9a1 1 0 0 0-.85-.46l-1.14.03-.56-.98"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export const ActivityBar = ({ activeSection }: ActivityBarProps) => (
  <aside className="activity-bar" aria-label="Primary navigation">
    <div className="activity-bar__brand" aria-label="NEXUS shell brand">
      NX
    </div>
    <nav className="activity-bar__nav" aria-label="Shell sections">
      {shellSections.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <Link
            key={section.id}
            className={`activity-bar__item${isActive ? ' is-active' : ''}`}
            aria-label={`${section.label}: ${section.description}`}
            aria-current={isActive ? 'page' : undefined}
            title={section.label}
            to={`/${section.id}`}
          >
            <span className="activity-bar__item-icon">{sectionIcons[section.id]}</span>
            <span className="sr-only">{section.label}</span>
          </Link>
        );
      })}
    </nav>
  </aside>
);
