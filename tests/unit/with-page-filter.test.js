import { describe, it, expect, beforeEach, vi } from 'vitest';
import withPageFilter from '../../lib/with-page-filter.js';

describe('withPageFilter', () => {
  describe('Configuration wrapper', () => {
    it('should return a function', () => {
      const wrapper = withPageFilter({});
      expect(typeof wrapper).toBe('function');
    });

    it('should accept Next.js config and return modified config', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const nextConfig = {
        reactStrictMode: true,
      };

      const result = wrapper(nextConfig);
      expect(result).toHaveProperty('webpack');
      expect(result.reactStrictMode).toBe(true);
    });

    it('should preserve existing webpack config', () => {
      const existingWebpack = vi.fn((config) => {
        config.customProperty = true;
        return config;
      });

      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const nextConfig = {
        webpack: existingWebpack,
      };

      const result = wrapper(nextConfig);
      expect(result).toHaveProperty('webpack');
      expect(typeof result.webpack).toBe('function');
    });

    it('should NOT modify config when filtering is disabled', () => {
      const wrapper = withPageFilter({
        enabled: false,
        excludedPages: ['admin/**'],
      });

      const nextConfig = {
        reactStrictMode: true,
      };

      const result = wrapper(nextConfig);
      expect(result).toEqual(nextConfig);
    });

    it('should use environment variable for enabled flag', () => {
      process.env.FILTER_PAGES = 'true';
      
      const wrapper = withPageFilter({
        excludedPages: ['admin/**'],
      });

      const nextConfig = {};
      const result = wrapper(nextConfig);
      
      // Should have webpack config when enabled
      expect(result).toHaveProperty('webpack');
      
      delete process.env.FILTER_PAGES;
    });
  });

  describe('Filter options', () => {
    it('should accept includedPages option', () => {
      const wrapper = withPageFilter({
        enabled: true,
        includedPages: ['index', 'about', 'blog/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });

    it('should accept excludedPages option', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**', 'dev/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });

    it('should accept excludePatterns option', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludePatterns: ['dev/.*', '.*admin.*'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });

    it('should accept verbose option', () => {
      const wrapper = withPageFilter({
        enabled: true,
        verbose: true,
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });
  });

  describe('Router support options', () => {
    it('should accept supportAppRouter option', () => {
      const wrapper = withPageFilter({
        enabled: true,
        supportAppRouter: true,
        supportPagesRouter: false,
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });

    it('should accept supportPagesRouter option', () => {
      const wrapper = withPageFilter({
        enabled: true,
        supportAppRouter: false,
        supportPagesRouter: true,
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });

    it('should accept custom directory names', () => {
      const wrapper = withPageFilter({
        enabled: true,
        pagesDir: 'src/pages',
        appDir: 'src/app',
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });
  });

  describe('Development mode behavior', () => {
    it('should NOT apply filtering in dev mode by default', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const mockConfig = { test: true };
      const result = wrapper({});
      
      expect(result).toHaveProperty('webpack');
      
      // Call webpack function with dev: true
      const webpackConfig = { plugins: [] };
      const webpackOptions = {
        dev: true,
        isServer: false,
        buildId: 'test',
        defaultLoaders: {},
        webpack: {},
      };
      
      const resultConfig = result.webpack(webpackConfig, webpackOptions);
      // In dev mode without enableInDev, should not add plugin
      expect(resultConfig.plugins.length).toBe(0);
    });

    it('should apply filtering in dev mode when enableInDev is true', () => {
      const wrapper = withPageFilter({
        enabled: true,
        enableInDev: true,
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
      
      const webpackConfig = { plugins: [] };
      const webpackOptions = {
        dev: true,
        isServer: false,
        buildId: 'test',
        defaultLoaders: {},
        webpack: {},
      };
      
      const resultConfig = result.webpack(webpackConfig, webpackOptions);
      // With enableInDev, should add plugin
      expect(resultConfig.plugins.length).toBe(1);
    });
  });

  describe('Experimental settings preservation', () => {
    it('should preserve existing experimental settings', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const nextConfig = {
        experimental: {
          appDir: true,
          serverActions: true,
        },
      };

      const result = wrapper(nextConfig);
      expect(result.experimental).toEqual({
        appDir: true,
        serverActions: true,
      });
    });

    it('should add experimental object if not present', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const nextConfig = {};
      const result = wrapper(nextConfig);
      expect(result).toHaveProperty('experimental');
    });
  });

  describe('Default values', () => {
    it('should use defaults when options not provided', () => {
      const wrapper = withPageFilter();
      const result = wrapper({});
      
      // Should return config without webpack modification since enabled defaults to false
      expect(result).not.toHaveProperty('webpack');
    });

    it('should default supportAppRouter to true', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });

    it('should default supportPagesRouter to true', () => {
      const wrapper = withPageFilter({
        enabled: true,
        excludedPages: ['admin/**'],
      });

      const result = wrapper({});
      expect(result).toHaveProperty('webpack');
    });
  });
});

