/**
 * Modal Queue Manager
 * Prevents modal stacking by showing one modal at a time with priority-based queuing
 */

export enum ModalPriority {
  CRITICAL = 1,    // Errors, payment issues
  ONBOARDING = 2,  // First-time user flows
  UPGRADE = 3,     // Conversion prompts
  INFO = 4,        // General information
}

export interface ModalConfig {
  id: string;
  priority: ModalPriority;
  component: React.ComponentType<any>;
  props?: any;
  isCritical?: boolean;
  onClose?: () => void;
}

class ModalQueueManager {
  private queue: ModalConfig[] = [];
  private current: ModalConfig | null = null;
  private lastShownTime: number = 0;
  private readonly MIN_DELAY_MS = 2000; // 2 seconds between modals
  private listeners: Set<(current: ModalConfig | null) => void> = new Set();

  /**
   * Add modal to queue
   */
  enqueue(modal: ModalConfig): void {
    // Check if modal already in queue
    if (this.queue.some(m => m.id === modal.id)) {
      console.log(`[ModalQueue] Modal ${modal.id} already in queue, skipping`);
      return;
    }

    // Check if modal is currently showing
    if (this.current?.id === modal.id) {
      console.log(`[ModalQueue] Modal ${modal.id} currently showing, skipping`);
      return;
    }

    // Add to queue sorted by priority
    this.queue.push(modal);
    this.queue.sort((a, b) => a.priority - b.priority);

    console.log(`[ModalQueue] Enqueued ${modal.id} with priority ${modal.priority}`);
    console.log(`[ModalQueue] Queue length: ${this.queue.length}`);

    // Try to show if no current modal
    this.tryShowNext();
  }

  /**
   * Remove current modal and show next
   */
  dequeue(): void {
    if (!this.current) return;

    console.log(`[ModalQueue] Dequeuing ${this.current.id}`);
    
    const closedModal = this.current;
    this.current = null;
    this.notifyListeners();

    // Call onClose callback
    if (closedModal.onClose) {
      closedModal.onClose();
    }

    // Try to show next after delay
    setTimeout(() => {
      this.tryShowNext();
    }, this.MIN_DELAY_MS);
  }

  /**
   * Try to show next modal in queue
   */
  private tryShowNext(): void {
    // Don't show if already showing a modal
    if (this.current) {
      console.log(`[ModalQueue] Modal ${this.current.id} currently showing, waiting`);
      return;
    }

    // Don't show if queue is empty
    if (this.queue.length === 0) {
      console.log(`[ModalQueue] Queue empty, nothing to show`);
      return;
    }

    // Check minimum delay between modals
    const timeSinceLastShown = Date.now() - this.lastShownTime;
    if (timeSinceLastShown < this.MIN_DELAY_MS) {
      const remainingDelay = this.MIN_DELAY_MS - timeSinceLastShown;
      console.log(`[ModalQueue] Waiting ${remainingDelay}ms before showing next modal`);
      setTimeout(() => this.tryShowNext(), remainingDelay);
      return;
    }

    // Show next modal
    const nextModal = this.queue.shift();
    if (nextModal) {
      this.current = nextModal;
      this.lastShownTime = Date.now();
      console.log(`[ModalQueue] Showing ${nextModal.id}`);
      this.notifyListeners();
    }
  }

  /**
   * Clear all queued modals (e.g., on navigation)
   */
  clear(): void {
    console.log(`[ModalQueue] Clearing queue (${this.queue.length} modals)`);
    this.queue = [];
    
    // Don't clear current modal, let it finish naturally
    if (this.current) {
      console.log(`[ModalQueue] Current modal ${this.current.id} will remain visible`);
    }
  }

  /**
   * Clear specific modal from queue
   */
  remove(modalId: string): void {
    const index = this.queue.findIndex(m => m.id === modalId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      console.log(`[ModalQueue] Removed ${modalId} from queue`);
    }

    // If it's the current modal, dequeue it
    if (this.current?.id === modalId) {
      this.dequeue();
    }
  }

  /**
   * Get current modal
   */
  getCurrent(): ModalConfig | null {
    return this.current;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Check if modal is in queue or showing
   */
  has(modalId: string): boolean {
    return this.current?.id === modalId || this.queue.some(m => m.id === modalId);
  }

  /**
   * Subscribe to modal changes
   */
  subscribe(listener: (current: ModalConfig | null) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of current modal change
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener(this.current);
    });
  }

  /**
   * Get debug info
   */
  getDebugInfo(): {
    current: string | null;
    queue: string[];
    queueLength: number;
  } {
    return {
      current: this.current?.id || null,
      queue: this.queue.map(m => `${m.id} (P${m.priority})`),
      queueLength: this.queue.length,
    };
  }
}

// Singleton instance
export const modalQueue = new ModalQueueManager();

// Helper function to show modal
export function showModal(config: ModalConfig): void {
  modalQueue.enqueue(config);
}

// Helper function to close current modal
export function closeModal(): void {
  modalQueue.dequeue();
}

// Helper function to clear queue
export function clearModalQueue(): void {
  modalQueue.clear();
}
