import { useState } from 'react';
import { Command } from 'cmdk';
import { useUiStore } from '../../store/uiStore';

export const CommandPalette = (): JSX.Element => {
  const [query, setQuery] = useState('');
  const { paletteOpen, setPaletteOpen } = useUiStore();

  return (
    <div style={{ display: paletteOpen ? 'block' : 'none' }}>
      <Command>
        <Command.Input value={query} onValueChange={setQuery} placeholder="Search commands..." />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>
          <Command.Group heading="Commands">
            <Command.Item onSelect={() => setPaletteOpen(false)}>Close Palette</Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
};
