import { describe, it, expect, beforeEach } from 'vitest';
import NextBuildFilterPlugin from '../../lib/next-build-filter-plugin.js';

describe('NextBuildFilterPlugin', () => {
  let plugin;

  beforeEach(() => {
    plugin = new NextBuildFilterPlugin({
      enabled: true,
      verbose: false,
      excludedPages: ['admin/**', 'dev/**'],
      pagesDir: 'pages',
      appDir: 'app',
      supportAppRouter: true,
      supportPagesRouter: true,
    });
  });

  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(plugin.normalizePath('pages\\admin\\users.js')).toBe('pages/admin/users.js');
      expect(plugin.normalizePath('app\\blog\\page.tsx')).toBe('app/blog/page.tsx');
    });

    it('should convert to lowercase', () => {
      expect(plugin.normalizePath('Pages/Admin/Users.js')).toBe('pages/admin/users.js');
      expect(plugin.normalizePath('APP/BLOG/Page.tsx')).toBe('app/blog/page.tsx');
    });

    it('should handle already normalized paths', () => {
      expect(plugin.normalizePath('pages/about.js')).toBe('pages/about.js');
      expect(plugin.normalizePath('app/contact/page.tsx')).toBe('app/contact/page.tsx');
    });
  });

  describe('extractRoutePath - Pages Router', () => {
    it('should extract route path from pages directory', () => {
      expect(plugin.extractRoutePath('project/pages/about.js')).toBe('about');
      expect(plugin.extractRoutePath('project/pages/admin/users.js')).toBe('admin/users');
      expect(plugin.extractRoutePath('project/pages/blog/post.tsx')).toBe('blog/post');
    });

    it('should extract route path with private-next-pages prefix', () => {
      expect(plugin.extractRoutePath('private-next-pages/about.js')).toBe('about');
      expect(plugin.extractRoutePath('private-next-pages/admin/users.js')).toBe('admin/users');
    });

    it('should handle index routes', () => {
      expect(plugin.extractRoutePath('project/pages/index.js')).toBe('index');
      expect(plugin.extractRoutePath('private-next-pages/index.tsx')).toBe('index');
    });

    it('should remove file extensions', () => {
      expect(plugin.extractRoutePath('project/pages/about.js')).toBe('about');
      expect(plugin.extractRoutePath('project/pages/about.jsx')).toBe('about');
      expect(plugin.extractRoutePath('project/pages/about.ts')).toBe('about');
      expect(plugin.extractRoutePath('project/pages/about.tsx')).toBe('about');
    });
  });

  describe('extractRoutePath - App Router', () => {
    it('should extract route path from app directory', () => {
      expect(plugin.extractRoutePath('project/app/about/page.tsx')).toBe('about');
      expect(plugin.extractRoutePath('project/app/admin/users/page.tsx')).toBe('admin/users');
      expect(plugin.extractRoutePath('project/app/blog/[slug]/page.tsx')).toBe('blog/[slug]');
    });

    it('should handle root page', () => {
      expect(plugin.extractRoutePath('project/app/page.tsx')).toBe('index');
      expect(plugin.extractRoutePath('project/app/page.js')).toBe('index');
    });

    it('should handle nested routes', () => {
      expect(plugin.extractRoutePath('project/app/products/category/[id]/page.tsx')).toBe('products/category/[id]');
    });
  });

  describe('isPageFile - Pages Router', () => {
    it('should identify page files in pages directory', () => {
      expect(plugin.isPageFile('project/pages/about.js', 'project/pages')).toBe(true);
      expect(plugin.isPageFile('project/pages/admin.tsx', 'project/pages')).toBe(true);
    });

    it('should reject non-page extensions', () => {
      expect(plugin.isPageFile('project/pages/styles.css', 'project/pages')).toBe(false);
      expect(plugin.isPageFile('project/pages/data.json', 'project/pages')).toBe(false);
    });

    it('should reject files outside pages directory', () => {
      expect(plugin.isPageFile('project/components/Button.tsx', 'project/components')).toBe(false);
      expect(plugin.isPageFile('project/lib/utils.js', 'project/lib')).toBe(false);
    });
  });

  describe('isPageFile - App Router', () => {
    it('should identify page.tsx files in app directory', () => {
      expect(plugin.isPageFile('project/app/about/page.tsx', 'project/app/about')).toBe(true);
      expect(plugin.isPageFile('project/app/admin/page.js', 'project/app/admin')).toBe(true);
    });

    it('should NOT filter layout files', () => {
      expect(plugin.isPageFile('project/app/layout.tsx', 'project/app')).toBe(false);
      expect(plugin.isPageFile('project/app/admin/layout.tsx', 'project/app/admin')).toBe(false);
    });

    it('should NOT filter other special App Router files', () => {
      expect(plugin.isPageFile('project/app/loading.tsx', 'project/app')).toBe(false);
      expect(plugin.isPageFile('project/app/error.tsx', 'project/app')).toBe(false);
      expect(plugin.isPageFile('project/app/not-found.tsx', 'project/app')).toBe(false);
      expect(plugin.isPageFile('project/app/template.tsx', 'project/app')).toBe(false);
    });
  });

  describe('shouldExcludePage - excludedPages with glob patterns', () => {
    it('should exclude pages matching glob patterns', () => {
      expect(plugin.shouldExcludePage('project/pages/admin/users.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/admin/settings.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/dev/debug.js')).toBe(true);
    });

    it('should NOT exclude pages not matching patterns', () => {
      expect(plugin.shouldExcludePage('project/pages/about.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/contact.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/blog/post.js')).toBe(false);
    });

    it('should handle nested admin routes', () => {
      expect(plugin.shouldExcludePage('project/pages/admin/users/edit.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/admin/settings/profile.js')).toBe(true);
    });
  });

  describe('shouldExcludePage - includedPages with glob patterns', () => {
    beforeEach(() => {
      plugin = new NextBuildFilterPlugin({
        enabled: true,
        verbose: false,
        includedPages: ['index', 'about', 'blog/**'],
        pagesDir: 'pages',
        appDir: 'app',
      });
    });

    it('should include pages matching patterns', () => {
      expect(plugin.shouldExcludePage('project/pages/index.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/about.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/blog/post1.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/blog/category/tech.js')).toBe(false);
    });

    it('should exclude pages NOT matching patterns', () => {
      expect(plugin.shouldExcludePage('project/pages/admin.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/contact.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/products/item.js')).toBe(true);
    });
  });

  describe('shouldExcludePage - regex patterns', () => {
    beforeEach(() => {
      plugin = new NextBuildFilterPlugin({
        enabled: true,
        verbose: false,
        excludePatterns: ['dev/.*', '.*admin.*', '^api/v[0-9]+/'],
        pagesDir: 'pages',
        appDir: 'app',
      });
    });

    it('should exclude pages matching regex patterns', () => {
      expect(plugin.shouldExcludePage('project/pages/dev/debug.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/dev/test.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/admin.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/user-admin.js')).toBe(true);
    });

    it('should NOT exclude pages not matching regex', () => {
      expect(plugin.shouldExcludePage('project/pages/about.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/contact.js')).toBe(false);
    });
  });

  describe('shouldExcludePage - combined patterns', () => {
    beforeEach(() => {
      plugin = new NextBuildFilterPlugin({
        enabled: true,
        verbose: false,
        excludedPages: ['admin/**', 'dev/**'],
        excludePatterns: ['.*test.*'],
        pagesDir: 'pages',
        appDir: 'app',
      });
    });

    it('should exclude pages matching either glob or regex', () => {
      expect(plugin.shouldExcludePage('project/pages/admin/users.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/dev/debug.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/user-test.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/test/utils.js')).toBe(true);
    });

    it('should NOT exclude pages matching neither', () => {
      expect(plugin.shouldExcludePage('project/pages/about.js')).toBe(false);
      expect(plugin.shouldExcludePage('project/pages/contact.js')).toBe(false);
    });
  });

  describe('Plugin configuration', () => {
    it('should use default options when not specified', () => {
      const defaultPlugin = new NextBuildFilterPlugin();
      expect(defaultPlugin.options.pagesDir).toBe('pages');
      expect(defaultPlugin.options.appDir).toBe('app');
      expect(defaultPlugin.options.supportAppRouter).toBe(true);
      expect(defaultPlugin.options.supportPagesRouter).toBe(true);
      expect(defaultPlugin.options.verbose).toBe(false);
    });

    it('should override default options', () => {
      const customPlugin = new NextBuildFilterPlugin({
        pagesDir: 'src/pages',
        appDir: 'src/app',
        supportAppRouter: false,
        verbose: true,
      });
      expect(customPlugin.options.pagesDir).toBe('src/pages');
      expect(customPlugin.options.appDir).toBe('src/app');
      expect(customPlugin.options.supportAppRouter).toBe(false);
      expect(customPlugin.options.verbose).toBe(true);
    });

    it('should respect enabled flag', () => {
      const disabledPlugin = new NextBuildFilterPlugin({
        enabled: false,
        excludedPages: ['admin/**'],
      });
      expect(disabledPlugin.options.enabled).toBe(false);
    });
  });

  describe('Backward compatibility', () => {
    beforeEach(() => {
      plugin = new NextBuildFilterPlugin({
        enabled: true,
        excludedPages: ['admin', 'dev/debug'],
        pagesDir: 'pages',
      });
    });

    it('should support exact string matching', () => {
      expect(plugin.shouldExcludePage('project/pages/admin.js')).toBe(true);
      expect(plugin.shouldExcludePage('project/pages/dev/debug.js')).toBe(true);
    });

    it('should support prefix matching for backward compatibility', () => {
      // The plugin should match admin/* when pattern is 'admin'
      expect(plugin.shouldExcludePage('project/pages/admin/users.js')).toBe(true);
    });
  });
});

