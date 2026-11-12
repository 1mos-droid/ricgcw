import React from 'react';
import RevealText from '../ui/smooth/RevealText';

export default function WorkspacePageHeader({ section, title, description, actions }) {
  return <header className="workspace-page-header"><div><span className="eyebrow">{section}</span><h1><RevealText>{title}</RevealText></h1><p>{description}</p></div>{actions && <div className="workspace-page-actions">{actions}</div>}</header>;
}
