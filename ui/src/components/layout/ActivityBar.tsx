import { Link } from 'react-router-dom';
import { shellSections, type ShellSectionId } from '@/config/design-system';

type ActivityBarProps = {
  activeSection: ShellSectionId;
};

export const ActivityBar = ({ activeSection }: ActivityBarProps) => (
  <aside className="activity-bar" aria-label="Primary navigation">
    <div className="activity-bar__brand">N</div>
    <nav className="activity-bar__nav">
      {shellSections.map((section) => {
        const isActive = section.id === activeSection;
        return (
          <Link
            key={section.id}
            className={`activity-bar__item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            to={`/${section.id}`}
          >
            <span className="activity-bar__item-label">{section.label.slice(0, 1)}</span>
            <span className="activity-bar__item-name">{section.label}</span>
          </Link>
        );
      })}
    </nav>
    <div className="activity-bar__footer">v</div>
  </aside>
);
