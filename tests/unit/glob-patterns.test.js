import { describe, it, expect, beforeEach } from 'vitest';
import { minimatch } from 'minimatch';

describe('Glob Pattern Matching', () => {
  describe('Basic glob patterns', () => {
    it('should match exact paths', () => {
      expect(minimatch('admin', 'admin')).toBe(true);
      expect(minimatch('about', 'about')).toBe(true);
      expect(minimatch('admin', 'user')).toBe(false);
    });

    it('should match single-level wildcards (*)', () => {
      expect(minimatch('blog/post1', 'blog/*')).toBe(true);
      expect(minimatch('blog/post2', 'blog/*')).toBe(true);
      expect(minimatch('blog/category/post1', 'blog/*')).toBe(false);
    });

    it('should match multi-level wildcards (**)', () => {
      expect(minimatch('admin/users', 'admin/**')).toBe(true);
      expect(minimatch('admin/users/edit', 'admin/**')).toBe(true);
      expect(minimatch('admin/settings/advanced/profile', 'admin/**')).toBe(true);
      expect(minimatch('user/profile', 'admin/**')).toBe(false);
    });

    it('should match patterns ending with /**', () => {
      expect(minimatch('dev/debug', 'dev/**')).toBe(true);
      expect(minimatch('dev/test/utils', 'dev/**')).toBe(true);
      expect(minimatch('production/main', 'dev/**')).toBe(false);
    });

    it('should match patterns with **/prefix', () => {
      expect(minimatch('api/test', '**/test')).toBe(true);
      expect(minimatch('admin/tools/test', '**/test')).toBe(true);
      expect(minimatch('test', '**/test')).toBe(true);
      expect(minimatch('api/testing', '**/test')).toBe(false);
    });

    it('should match patterns with wildcard in middle', () => {
      expect(minimatch('api/users/internal', 'api/*/internal')).toBe(true);
      expect(minimatch('api/products/internal', 'api/*/internal')).toBe(true);
      expect(minimatch('api/v1/users/internal', 'api/*/internal')).toBe(false);
    });
  });

  describe('Advanced glob patterns', () => {
    it('should match character ranges', () => {
      expect(minimatch('user/1/profile', 'user/?/profile')).toBe(true);
      expect(minimatch('user/a/profile', 'user/?/profile')).toBe(true);
      expect(minimatch('user/12/profile', 'user/?/profile')).toBe(false);
    });

    it('should match brace expansions', () => {
      expect(minimatch('admin/users', '{admin,dev}/**')).toBe(true);
      expect(minimatch('dev/debug', '{admin,dev}/**')).toBe(true);
      expect(minimatch('prod/users', '{admin,dev}/**')).toBe(false);
    });

    it('should match patterns with **/ in middle', () => {
      expect(minimatch('api/internal/users', '**/internal/**')).toBe(true);
      expect(minimatch('internal/users', '**/internal/**')).toBe(true);
      expect(minimatch('api/users', '**/internal/**')).toBe(false);
    });

    it('should match suffix patterns', () => {
      expect(minimatch('blog/post-draft', '**/*-draft')).toBe(true);
      expect(minimatch('products/item-draft', '**/*-draft')).toBe(true);
      expect(minimatch('blog/post', '**/*-draft')).toBe(false);
    });

    it('should match prefix patterns', () => {
      expect(minimatch('test-login', 'test-*')).toBe(true);
      expect(minimatch('test-signup', 'test-*')).toBe(true);
      expect(minimatch('login-test', 'test-*')).toBe(false);
    });
  });

  describe('Real-world use cases', () => {
    it('should exclude all admin routes', () => {
      const pattern = 'admin/**';
      expect(minimatch('admin/users', pattern)).toBe(true);
      expect(minimatch('admin/users/edit', pattern)).toBe(true);
      expect(minimatch('admin/settings', pattern)).toBe(true);
      expect(minimatch('user/profile', pattern)).toBe(false);
    });

    it('should exclude test pages', () => {
      const patterns = ['**/*-test', '**/test/**', 'test/**'];
      expect(patterns.some(p => minimatch('api/users-test', p))).toBe(true);
      expect(patterns.some(p => minimatch('test/utils', p))).toBe(true);
      expect(patterns.some(p => minimatch('components/test/button', p))).toBe(true);
      expect(patterns.some(p => minimatch('api/users', p))).toBe(false);
    });

    it('should include only blog routes', () => {
      const pattern = 'blog/**';
      expect(minimatch('blog/posts', pattern)).toBe(true);
      expect(minimatch('blog/category/tech', pattern)).toBe(true);
      expect(minimatch('admin/users', pattern)).toBe(false);
    });

    it('should exclude internal API routes', () => {
      const pattern = 'api/*/internal';
      expect(minimatch('api/users/internal', pattern)).toBe(true);
      expect(minimatch('api/products/internal', pattern)).toBe(true);
      expect(minimatch('api/users', pattern)).toBe(false);
    });

    it('should handle multi-language exclusion', () => {
      const patterns = ['fr/**', 'de/**', 'es/**', 'ja/**'];
      expect(patterns.some(p => minimatch('fr/about', p))).toBe(true);
      expect(patterns.some(p => minimatch('de/contact', p))).toBe(true);
      expect(patterns.some(p => minimatch('en/about', p))).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty strings', () => {
      expect(minimatch('', '')).toBe(true);
      expect(minimatch('admin', '')).toBe(false);
    });

    it('should handle root index', () => {
      expect(minimatch('index', 'index')).toBe(true);
      expect(minimatch('index', '*')).toBe(true);
    });

    it('should be case-sensitive by default', () => {
      expect(minimatch('Admin', 'admin')).toBe(false);
      expect(minimatch('admin', 'Admin')).toBe(false);
      expect(minimatch('admin', 'admin')).toBe(true);
    });

    it('should handle paths with multiple slashes', () => {
      expect(minimatch('a/b/c/d/e', 'a/**')).toBe(true);
      expect(minimatch('a/b/c/d/e', '**/*')).toBe(true);
    });
  });
});

