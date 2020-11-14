import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

export function useObservable<T>(observable: Observable<T> | (() => Observable<T>), initialValue: T): T {
	const [ stream ] = useState(observable)
	const [ value, setValue ] = useState(initialValue)

	useEffect(() => {
		const subscription = stream.subscribe(next => {
			setValue(next)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	return value
}
