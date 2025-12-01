import { VaultWatcher } from './watcher';
import * as chokidar from 'chokidar';
import * as fs from 'fs/promises';
import * as path from 'path';

jest.mock('chokidar');
jest.mock('fs/promises');

describe('VaultWatcher', () => {
  let watcher: VaultWatcher;
  const vaultPath = '/tmp/vault';
  let mockChokidarWatcher: any;
  let eventHandlers: { [key: string]: (path: string) => void } = {};

  beforeEach(() => {
    eventHandlers = {};
    mockChokidarWatcher = {
      on: jest.fn().mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
        return mockChokidarWatcher;
      }),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (chokidar.watch as jest.Mock).mockReturnValue(mockChokidarWatcher);
    (fs.readFile as jest.Mock).mockResolvedValue('---\ntype: Note\n---\nContent');

    watcher = new VaultWatcher(vaultPath);
  });

  afterEach(async () => {
    await watcher.stop();
    jest.clearAllMocks();
  });

  it('should start watching the vault', async () => {
    await watcher.start();
    expect(chokidar.watch).toHaveBeenCalledWith(vaultPath, expect.any(Object));
  });

  it('should emit add event with parsed content', (done) => {
    watcher.start().then(() => {
      watcher.events$.subscribe((event) => {
        try {
          expect(event.type).toBe('add');
          expect(event.path).toBe('/tmp/vault/note.md');
          expect(event.parsed).toBeDefined();
          expect(event.parsed?.frontmatter.type).toBe('Note');
          done();
        } catch (error) {
          done(error);
        }
      });

      // Simulate 'add' event from chokidar
      if (eventHandlers['add']) {
        eventHandlers['add']('/tmp/vault/note.md');
      } else {
        done(new Error('Add handler not registered'));
      }
    });
  });

  it('should emit change event with parsed content', (done) => {
    watcher.start().then(() => {
      watcher.events$.subscribe((event) => {
        try {
          expect(event.type).toBe('change');
          expect(event.path).toBe('/tmp/vault/note.md');
          expect(event.parsed).toBeDefined();
          done();
        } catch (error) {
          done(error);
        }
      });

      if (eventHandlers['change']) {
        eventHandlers['change']('/tmp/vault/note.md');
      } else {
        done(new Error('Change handler not registered'));
      }
    });
  });

  it('should emit unlink event', (done) => {
    watcher.start().then(() => {
      watcher.events$.subscribe((event) => {
        try {
          expect(event.type).toBe('unlink');
          expect(event.path).toBe('/tmp/vault/note.md');
          expect(event.parsed).toBeUndefined();
          done();
        } catch (error) {
          done(error);
        }
      });

      if (eventHandlers['unlink']) {
        eventHandlers['unlink']('/tmp/vault/note.md');
      } else {
        done(new Error('Unlink handler not registered'));
      }
    });
  });

  it('should ignore non-markdown files', async () => {
    await watcher.start();
    const spy = jest.spyOn(watcher.events$, 'next');

    if (eventHandlers['add']) {
      await eventHandlers['add']('/tmp/vault/image.png');
    }

    expect(spy).not.toHaveBeenCalled();
  });

  it('should stop watching', async () => {
    await watcher.start();
    await watcher.stop();
    expect(mockChokidarWatcher.close).toHaveBeenCalled();
  });
});
