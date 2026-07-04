import { Link } from 'react-router-dom';
import { shellSections, type ShellSectionId } from '@/config/design-system';

type ActivityBarProps = {
  activeSection: ShellSectionId;
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
            to={`/${section.id}`}
          >
            <span className="activity-bar__item-badge" aria-hidden="true">
              {section.shortLabel}
            </span>
            <span className="activity-bar__item-text">
              <span className="activity-bar__item-label">{section.label}</span>
              <span className="activity-bar__item-description">{section.description}</span>
            </span>
          </Link>
        );
      })}
    </nav>
    <div className="activity-bar__footer" aria-label="Shell version">
      v
    </div>
  </aside>
);
