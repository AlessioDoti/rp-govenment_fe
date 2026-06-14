import { describe, it, expect, vi, beforeEach } from 'vitest'
import { lastClickY, initClickTracker } from '@/utils/clickPosition.js'

describe('clickPosition', () => {
  beforeEach(() => {
    lastClickY.value = 0
  })

  it('exports a ref lastClickY initialized to 0', () => {
    expect(lastClickY.value).toBe(0)
  })

  it('initClickTracker adds mousedown listener on document', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
    initClickTracker()
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
  })

  it('updates lastClickY on normal mousedown events', () => {
    initClickTracker()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const event = new MouseEvent('mousedown', { clientY: 150, bubbles: true })
    el.dispatchEvent(event)
    expect(lastClickY.value).toBe(150)
    document.body.removeChild(el)
  })

  it('does not update lastClickY when clicking inside a modal', () => {
    initClickTracker()
    const modal = document.createElement('div')
    modal.className = 'modal'
    document.body.appendChild(modal)
    const event = new MouseEvent('mousedown', { clientY: 200, bubbles: true })
    modal.dispatchEvent(event)
    expect(lastClickY.value).toBe(0)
    document.body.removeChild(modal)
  })

  it('does nothing if document is undefined', () => {
    const origDoc = global.document
    global.document = undefined
    expect(() => initClickTracker()).not.toThrow()
    global.document = origDoc
  })
})
