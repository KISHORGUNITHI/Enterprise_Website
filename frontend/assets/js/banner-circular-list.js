/**
 * banner-circular-list.js
 * High-performance Circular Doubly Linked List data structure for storefront banners.
 * Ensures infinite loop transitions (last banner -> 1st banner, and 1st banner -> last banner).
 */

class BannerNode {
  /**
   * @param {Object} data - Banner attributes (title, subtitle, eyebrow, ctaText, slug, etc.)
   */
  constructor(data) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

class CircularBannerList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  /**
   * Append a banner to the circular doubly linked list.
   * Maintains invariant: tail.next === head && head.prev === tail
   * @param {Object} data
   * @returns {BannerNode}
   */
  append(data) {
    const node = new BannerNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
      node.next = node;
      node.prev = node;
      this.current = node;
    } else {
      node.prev = this.tail;
      node.next = this.head;
      this.tail.next = node;
      this.head.prev = node;
      this.tail = node;
    }
    this.size++;
    return node;
  }

  /**
   * Populate from an array of banner objects.
   * @param {Array<Object>} array
   * @returns {CircularBannerList}
   */
  fromArray(array) {
    this.clear();
    if (Array.isArray(array)) {
      array.forEach(item => this.append(item));
    }
    return this;
  }

  /**
   * Advance current pointer to the next banner.
   * If on tail, smoothly wraps to head (last -> 1st banner).
   * @returns {BannerNode|null}
   */
  next() {
    if (!this.current) return null;
    this.current = this.current.next;
    return this.current;
  }

  /**
   * Step current pointer backward to the previous banner.
   * If on head, smoothly wraps to tail (1st -> last banner).
   * @returns {BannerNode|null}
   */
  prev() {
    if (!this.current) return null;
    this.current = this.current.prev;
    return this.current;
  }

  /**
   * Returns current active node
   * @returns {BannerNode|null}
   */
  getCurrent() {
    return this.current;
  }

  /**
   * Returns zero-based index of current active node from head
   * @returns {number}
   */
  getCurrentIndex() {
    if (!this.current || this.size === 0) return -1;
    let node = this.head;
    for (let i = 0; i < this.size; i++) {
      if (node === this.current) return i;
      node = node.next;
    }
    return 0;
  }

  /**
   * Circulates directly to target index (modulo size)
   * @param {number} targetIndex
   * @returns {BannerNode|null}
   */
  goToIndex(targetIndex) {
    if (this.size === 0) return null;
    const normalized = ((targetIndex % this.size) + this.size) % this.size;
    let node = this.head;
    for (let i = 0; i < normalized; i++) {
      node = node.next;
    }
    this.current = node;
    return this.current;
  }

  /**
   * Convert circular list to plain array for rendering
   * @returns {Array<Object>}
   */
  toArray() {
    if (!this.head || this.size === 0) return [];
    const arr = [];
    let curr = this.head;
    for (let i = 0; i < this.size; i++) {
      arr.push(curr.data);
      curr = curr.next;
    }
    return arr;
  }

  /**
   * Check if list has no items
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * Clear list and reset pointers
   */
  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }
}

// Export for browser window and Node/ESM module if applicable
if (typeof window !== 'undefined') {
  window.BannerNode = BannerNode;
  window.CircularBannerList = CircularBannerList;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BannerNode, CircularBannerList };
}
