import { shellSections, type ShellSectionId } from '@/config/design-system';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSidebarItemsForSection } from '@/data/mock-shell';

type SidebarProps = {
  activeSection: ShellSectionId;
};

const itemTone = (state: 'ready' | 'placeholder' | 'mock') => {
  if (state === 'ready') return 'success';
  if (state === 'mock') return 'accent';
  return 'warning';
};

export const Sidebar = ({ activeSection }: SidebarProps) => {
  const section = shellSections.find((entry) => entry.id === activeSection) ?? shellSections[0];
  const items = getSidebarItemsForSection(activeSection);

  return (
    <aside className="sidebar" aria-label={`${section.label} sidebar`}>
      <Card eyebrow="Section" title={section.label} className="sidebar__card sidebar__card--primary">
        <p className="nexus-copy">{section.description}</p>
      </Card>

      <Card eyebrow="Plugin inventory" title={`${section.label} items`} className="sidebar__card sidebar__card--dense">
        <div className="sidebar__list" role="list" aria-label={`${section.label} items`}>
          {items.map((item) => (
            <article key={`${activeSection}-${item.title}`} className="sidebar__item" role="listitem">
              <div className="sidebar__item-header">
                <strong>{item.title}</strong>
                <Badge tone={itemTone(item.state)}>{item.state}</Badge>
              </div>
              <p className="nexus-copy nexus-copy--muted">{item.detail}</p>
            </article>
          ))}
        </div>
      </Card>
    </aside>
  );
};
