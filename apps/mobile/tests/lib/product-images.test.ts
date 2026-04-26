import { describe, expect, it } from 'vitest';
import { apiFileUrl, productImageThumbPath } from '../../src/lib/product-images';

describe('apiFileUrl', () => {
  it('returns absolute URLs unchanged', () => {
    expect(apiFileUrl('https://x.com/a.jpg')).toBe('https://x.com/a.jpg');
  });
});

describe('productImageThumbPath', () => {
  it('inserts _thumb before extension for local uploads', () => {
    expect(productImageThumbPath('/uploads/products/a.webp')).toBe('/uploads/products/a_thumb.webp');
  });

  it('leaves remote URLs unchanged', () => {
    expect(productImageThumbPath('https://cdn/a.jpg')).toBe('https://cdn/a.jpg');
  });
});
