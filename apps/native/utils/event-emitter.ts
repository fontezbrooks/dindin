import logger from './logger';

/**
 * Simple EventEmitter implementation for React Native
 * Since React Native doesn't include Node's EventEmitter,
 * we create a lightweight version for our WebSocket manager
 */

type EventListener = (...args: any[]) => void;

export class EventEmitter {
	private events: Map<string, EventListener[]> = new Map();

	on(event: string, listener: EventListener): void {
		if (!this.events.has(event)) {
			this.events.set(event, []);
		}
		this.events.get(event)!.push(listener);
	}

	off(event: string, listener: EventListener): void {
		const listeners = this.events.get(event);
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	}

	emit(event: string, ...args: any[]): void {
		const listeners = this.events.get(event);
		if (listeners) {
			listeners.forEach((listener) => {
				try {
					listener(...args);
				} catch (error) {
					logger.error(`Error in event listener for ${event}:`, error);
				}
			});
		}
	}

	once(event: string, listener: EventListener): void {
		const onceWrapper = (...args: any[]) => {
			listener(...args);
			this.off(event, onceWrapper);
		};
		this.on(event, onceWrapper);
	}

	removeAllListeners(event?: string): void {
		if (event) {
			this.events.delete(event);
		} else {
			this.events.clear();
		}
	}

	listenerCount(event: string): number {
		const listeners = this.events.get(event);
		return listeners ? listeners.length : 0;
	}
}
