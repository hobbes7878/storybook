import type { FC, PropsWithChildren } from 'react';
import React, { useEffect } from 'react';
import { global } from '@storybook/global';
import type { ThemeVars } from '@storybook/theming';
import { ThemeProvider, ensure as ensureTheme } from '@storybook/theming';
import type { Renderer } from '@storybook/types';
import { DocsPageWrapper } from '../components';
import type { DocsContextProps } from './DocsContext';
import { DocsContext } from './DocsContext';
import { SourceContainer } from './SourceContainer';
import { scrollToElement } from './utils';
import { useOf } from './useOf';

const { document, window: globalWindow } = global;

export interface DocsContainerProps<TFramework extends Renderer = Renderer> {
  context: DocsContextProps<TFramework>;
  theme?: ThemeVars;
}

export const DocsContainer: FC<PropsWithChildren<DocsContainerProps>> = ({
  context,
  theme,
  children,
}) => {
  let toc;
  try {
    const meta = useOf('meta', ['meta']);
    toc = meta.preparedMeta.parameters?.docs?.toc || {};
  } catch (err) {
    // No meta, falling back to project annotations
    toc = context?.projectAnnotations?.parameters?.docs?.toc || {};
  }

  useEffect(() => {
    let url;
    try {
      url = new URL(globalWindow.parent.location.toString());
      if (url.hash) {
        const element = document.getElementById(url.hash.substring(1));
        if (element) {
          // Introducing a delay to ensure scrolling works when it's a full refresh.
          setTimeout(() => {
            scrollToElement(element);
          }, 200);
        }
      }
    } catch (err) {
      // pass
    }
  });

  return (
    <DocsContext.Provider value={context}>
      <SourceContainer channel={context.channel}>
        <ThemeProvider theme={ensureTheme(theme)}>
          <DocsPageWrapper toc={toc}>{children}</DocsPageWrapper>
        </ThemeProvider>
      </SourceContainer>
    </DocsContext.Provider>
  );
};
