import { renderHook, act } from '@testing-library/react-hooks'
import { BehaviorSubject, Subject, Observable } from 'rxjs'

import { useObservable } from './useObservable'

describe('useObservable', () => {
	test('async subject', () => {
		const hello$ = new Subject()
		const { result } = renderHook(() => useObservable(hello$, ''))
		expect(result.current).toBe('')
		act(() => {
			hello$.next('hello')
		})
		expect(result.current).toBe('hello')
	})

	test('many async value', () => {
		const hello$ = new Subject()
		const { result } = renderHook(() => useObservable(hello$, 0))
		expect(result.current).toBe(0)
		act(() => hello$.next(1))
		expect(result.current).toBe(1)
		act(() => hello$.next(2))
		expect(result.current).toBe(2)
	})

	test('complete subject', () => {
		const hello$ = new Subject()
		const { result } = renderHook(() => useObservable(hello$, 0))
		expect(result.current).toBe(0)
		act(() => hello$.complete())
		expect(result.current).toBe(0)
	})

	test('unsubscribe on unmount', () => {
		const hello$ = new Subject()
		expect(hello$.observers).toHaveLength(0)
		const { unmount } = renderHook(() => useObservable(hello$, 0))
		expect(hello$.observers).toHaveLength(1)
		unmount()
		expect(hello$.observers).toHaveLength(0)
	})

	test('many unsubscribe on unmount', () => {
		const hello$ = new Subject()
		expect(hello$.observers).toHaveLength(0)
		const a = renderHook(() => useObservable(hello$, 0))
		const b = renderHook(() => useObservable(hello$, 1))
		expect(hello$.observers).toHaveLength(2)
		a.unmount()
		expect(hello$.observers).toHaveLength(1)
		b.unmount()
		expect(hello$.observers).toHaveLength(0)
	})

	test('on rerender', () => {
		const hello$ = new Subject()
		const spyOnSubscribe = jest.spyOn(hello$, 'subscribe')
		const { rerender } = renderHook(() => useObservable(hello$, 0))
		expect(spyOnSubscribe).toHaveBeenCalledTimes(1)
		rerender()
		expect(spyOnSubscribe).toHaveBeenCalledTimes(1)
	})

	test('with callback', () => {
		const mockObservableOf = jest.fn((n: number): Observable<number> => new BehaviorSubject(n))
		const { rerender, result } = renderHook(() => useObservable(() => mockObservableOf(42), 51))
		expect(mockObservableOf).toHaveBeenCalledTimes(1)
		expect(result.current).toBe(42)
		rerender()
		expect(mockObservableOf).toHaveBeenCalledTimes(1)
	})
})
