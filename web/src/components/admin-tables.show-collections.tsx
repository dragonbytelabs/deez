import { css } from "@linaria/core";
import { For, Show, type Component } from "solid-js";

const sidebar = css`
  width: 270px;
  background: var(--gray800);
  border-right: 1px solid var(--gray700);
  display: flex;
  flex-direction: column;
  height: 100%;
  
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--gray700);
  }
`;

const collectionsHeader = css`
  padding: 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--gray700);
`;

const collectionsList = css`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const collectionItem = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray500);
  
  &:hover {
    background: var(--gray700);
    color: var(--white);
  }
  
  &.active {
    background: var(--gray700);
    color: var(--white);
  }
`;

const collectionIcon = css`
  font-size: 18px;
  min-width: 18px;
`;

const collectionName = css`
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const loading = css`
  text-align: center;
  padding: 20px;
  color: var(--gray500);
  font-size: 14px;
`;

interface ShowCollectionsProps {
  collections: string[];
  selectedCollection: string | null;
  isLoading: boolean;
  onSelectCollection: (name: string) => void;
}

export const ShowCollections: Component<ShowCollectionsProps> = (props) => {

  return (
    <div class={sidebar}>
      <div class={collectionsHeader}>
        Collections
      </div>

      <div class={collectionsList}>
        <Show when={props.isLoading}>
          <div class={loading}>Loading collections...</div>
        </Show>

        <Show when={!props.isLoading}>
          <For each={props.collections}>
            {(collection) => (
              <div
                class={collectionItem}
                classList={{ active: props.selectedCollection === collection }}
                onClick={() => props.onSelectCollection(collection)}
              >
                <span class={collectionIcon}>👥</span>
                <span class={collectionName}>{collection}</span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};