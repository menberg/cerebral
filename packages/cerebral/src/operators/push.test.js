/* eslint-env mocha */
import Controller from '../Controller'
import assert from 'assert'
import {input, push, state} from './'

describe('operator.push', () => {
  it('should push value in model', () => {
    const controller = new Controller({
      state: {
        list: ['a', 'b']
      },
      signals: {
        test: [
          push(state`list`, 'c')
        ]
      }
    })
    controller.getSignal('test')()
    assert.deepEqual(controller.getState(), {list: ['a', 'b', 'c']})
  })
  it('should push value from input in model', () => {
    const controller = new Controller({
      state: {
        list: ['a', 'b']
      },
      signals: {
        test: [
          push(state`list`, input`value`)
        ]
      }
    })
    controller.getSignal('test')({value: 'c'})
    assert.deepEqual(controller.getState(), {list: ['a', 'b', 'c']})
  })
  it('should throw on bad argument', () => {
    const controller = new Controller({
      state: {
      },
      signals: {
        test: [
          push(input`list`, 'bar')
        ]
      }
    })
    assert.throws(() => {
      controller.getSignal('test')({list: ['one']})
    }, /operator.push/)
  })
})