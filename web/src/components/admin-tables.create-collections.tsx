import { css } from "@linaria/core";

const footer = css`
  padding: 16px;
  border-top: 1px solid var(--gray700);
`;

const newCollectionButton = css`
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--gray600);
  border-radius: 8px;
  color: var(--white);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: var(--gray700);
    border-color: var(--primary);
  }
`;

export const CreateCollection = () => {

  return (
      <div class={footer}>
        <button class={newCollectionButton}>
          <span>+</span>
          <span>New collection</span>
        </button>
      </div>
  );
};