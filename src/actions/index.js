import fetch from 'isomorphic-fetch'

export const REQUEST_RESOURCE = 'REQUEST_RESOURCE'
export const RECEIVE_RESOURCE = 'RECEIVE_RESOURCE'
export const GET_COLLATION_SOURCES = 'GET_COLLATION_SOURCES'
export const SET_VARIANTS = 'SET_VARIANTS'
export const SET_MUSIC_VARIANTS = 'SET_MUSIC_VARIANTS'
export const SET_POPOUT_POSITION = 'SET_POPOUT_POSITION'
export const SET_MUSIC_POPOUT_POSITION = 'SET_MUSIC_POPOUT_POSITION'
export const UNSET_POPOUT_POSITION = 'UNSET_POPOUT_POSITION'

const parser = new window.DOMParser()
const serializer = new window.XMLSerializer()
serializer

function uuid() {
  let value = ''
  let i
  let random
  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0

    if (i === 8 || i === 12 || i === 16 || i === 20) {
      value += '-'
    }
    value += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16)
  }
  return value
}

function requestResource(url, docType) {
  return {
    type: REQUEST_RESOURCE,
    url,
    docType
  }
}

function receiveResource(data, docType) {
  return {
    type: RECEIVE_RESOURCE,
    data,
    receivedAt: Date.now(),
    docType
  }
}

function getCollationSources() {
  return {
    type: GET_COLLATION_SOURCES,
  }
}

export function setVariants(variants) {
  return {
    type: SET_VARIANTS,
    variants
  }
}

export function setMusicVariants(variants) {
  return {
    type: SET_MUSIC_VARIANTS,
    variants
  }
}

export function setPopoutPosition(rect) {
  return {
    type: SET_POPOUT_POSITION,
    rect
  }
}

export function setMusicPopoutPosition(rect) {
  return {
    type: SET_MUSIC_POPOUT_POSITION,
    rect
  }
}

export function unsetPopoutPosition() {
  return {
    type: UNSET_POPOUT_POSITION
  }
}

/** ********
 * thunks *
 ******** **/

export function getResource(url, docType) {
  if (!url && docType === 'mei') {
    return dispatch => {
      dispatch(receiveResource('nodata', docType))
    }
  }
  return dispatch => {
    dispatch(requestResource(url, docType))
    return fetch(url)
      .then(response => response.text())
      .then(data => dispatch(receiveResource(data, docType)))
  }
}

export function getCollation(url) {
  return dispatch => {
    dispatch(getResource(url, 'collation'))
      .then(() => dispatch(getCollationSources()))
  }
}

export function getVariants(app, lemma) {
  return dispatch => {
    const variants = []
    const promises = []
    for (const reading of Array.from(app.querySelectorAll('app > *'))) {
      if (reading.tagName === 'rdg') {
        const wit = reading.getAttribute('wit')
        const isLemma = wit === lemma ? true : false
        if (reading.children.length > 0) {
          const sourceAndId = reading.children[0].getAttribute('target').split('#')
          const teiUrl = sourceAndId[0]
          promises.push(
            fetch(teiUrl)
              .then(response => response.text())
              .then(text => {
                const source = parser.parseFromString(text, 'text/xml')
                let variant = source.querySelector(`[*|id="${sourceAndId[1]}"]`)
                if (variant.querySelector('expan')) {
                  variant = variant.querySelector('expan')
                }
                variants.push({
                  group: uuid(),
                  values: [
                    {
                      text: variant.textContent,
                      sourceUrl: sourceAndId[0],
                      wit,
                      isLemma
                    }
                  ]
                })
              })
          )
        } else {
          variants.push({
            group: uuid(),
            values: [
              {
                text: '[omitted.]',
                wit,
                isLemma
              }
            ]
          })
        }
      } else {
        const values = []
        for (const rdg of Array.from(reading.getElementsByTagName('rdg'))) {
          const wit = rdg.getAttribute('wit')
          const isLemma = wit === lemma ? true : false
          if (rdg.children.length > 0) {
            const sourceAndId = rdg.children[0].getAttribute('target').split('#')
            const teiUrl = sourceAndId[0]
            promises.push(
              fetch(teiUrl)
                .then(response => response.text())
                .then(text => {
                  const source = parser.parseFromString(text, 'text/xml')
                  let variant = source.querySelector(`[*|id="${sourceAndId[1]}"]`)
                  if (variant.querySelector('expan')) {
                    variant = variant.querySelector('expan')
                  }
                  values.push({
                    text: variant.textContent,
                    sourceUrl: sourceAndId[0],
                    wit,
                    isLemma
                  })
                })
            )
          } else {
            values.push({
              text: '[omitted.]',
              wit,
              isLemma
            })
          }
        }
        const group = reading.getAttribute('n') ? reading.getAttribute('n') : uuid()
        variants.push({ group, values })
      }
    }
    Promise.all(promises).then(() => {
      dispatch(setVariants(variants))
    })
  }
}

function previousSibling( elem, until ) {
  // Adapted from jQuery
  let matched = null

  while ( ( elem = elem.previousSibling ) && elem.nodeType !== 9 ) {
    if ( elem.nodeType === 1 && elem.tagName === until) {
      matched = elem
      break
    }
  }
  return matched
}

function getScoreDefFor( variant, staffNumber ) {
  let closestScoreDef = previousSibling(variant.closest('measure'), 'scoreDef')

  if (!closestScoreDef) {
    // Look further up
    closestScoreDef = previousSibling(variant.closest('section'), 'scoreDef')
  }
  // Does the scoreDef have everything we need?
  let fullScoreDef = closestScoreDef
  while (!fullScoreDef.querySelector(`staffDef[n='${staffNumber}']`)) {
    fullScoreDef = previousSibling(variant.closest('section'), 'scoreDef')
  }

  const scoreDef = fullScoreDef
  scoreDef.querySelector(`staffDef:not([n='${staffNumber}'])`).remove()

  scoreDef.setAttribute('meter.count', closestScoreDef.getAttribute('meter.count'))
  scoreDef.setAttribute('meter.unit', closestScoreDef.getAttribute('meter.unit'))

  return scoreDef
}

export function getMusicVariants(app, lemma) {
  return dispatch => {
    const variants = []
    const promises = []
    const appType = app.getAttribute('type')
    // Identify groups
    const groups = {}
    for (const reading of Array.from(app.querySelectorAll('app > *'))) {
      const sameAs = reading.getAttribute('sameas')
      const xmlid = reading.getAttribute('xml:id')
      if (sameAs) {
        // is there a group with this id as member already?
        let found = false
        for (const gId of Object.keys(groups)) {
          const pos = groups[gId].needed.indexOf(`#${xmlid}`)
          if (pos > -1) {
            groups[gId].rdgs.push(reading)
            groups[gId].needed.splice(pos, 1)
            found = true
          }
        }
        if (!found) {
          // start new group and add sameAs ids as 'needed'
          groups[uuid()] = {
            needed: sameAs.split(' '),
            rdgs: [reading]
          }
        }
      } else {
        groups[uuid()] = {
          needed: [],
          rdgs: [reading]
        }
      }
    }
    // Now loop on groups and genereate score snippets
    for (const groupId of Object.keys(groups)) {
      const values = []
      const group = groups[groupId]
      for (const reading of group.rdgs) {
        const wit = reading.getAttribute('source')
        const isLemma = wit === lemma ? true : false
        if (!reading.getAttribute('target')) {
          values.push({isOmitted: true, wit})
          continue
        }
        const targets = reading.getAttribute('target').trim().split(/\s+/m)
        const meiUrl = targets[0].split('#')[0] // Get MEI url from first target; they must all point ot the same file
        promises.push(
          fetch(meiUrl)
            .then(response => response.text())
            .then(text => {
              const meisource = parser.parseFromString(text, 'text/xml')

              const section = parser.parseFromString('<section></section>', 'text/xml')
              let scoreDef

              for (const [idx, target] of targets.entries()) {
                const sourceAndId = target.split('#')
                const variant = meisource.querySelector(`[*|id="${sourceAndId[1]}"]`)
                let m
                let s
                let l

                const curMeasure = variant.tagName === 'measure' ? variant.getAttribute('n') : variant.closest('measure').getAttribute('n')
                let curStaff
                if (variant.tagName === 'staff' || variant.closest('staff')) {
                  curStaff = variant.tagName === 'staff' ? variant.getAttribute('n') : variant.closest('staff').getAttribute('n')
                }
                let curLayer
                if (variant.tagName === 'layer' || variant.closest('layer')) {
                  curLayer = variant.tagName === 'layer' ? variant.getAttribute('n') : variant.closest('layer').getAttribute('n')
                }

                switch (variant.tagName) {
                  case 'measure':
                    if (appType === 'barline') {
                      m = section.createElement('measure')
                      for (const att of Array.from(variant.attributes)) {
                        m.setAttribute(att.name, att.value)
                      }
                      s = section.createElement('staff')
                      s.setAttribute('n', '1')
                      m.appendChild(s)
                      section.documentElement.appendChild(m)
                    } else {
                      section.documentElement.appendChild(variant.cloneNode(true))
                    }
                    break
                  case 'staff':
                    m = section.querySelectorAll(`measure[n='${curMeasure}']`)[0]
                    if (!m) {
                      m = section.createElement('measure')
                      m.setAttribute('n', curMeasure)
                      section.documentElement.appendChild(m)
                    }
                    m.appendChild(variant.cloneNode(true))
                    break
                  case 'layer':
                    m = section.querySelectorAll(`measure[n='${curMeasure}']`)[0]
                    if (!m) {
                      m = section.createElement('measure')
                      m.setAttribute('n', curMeasure)
                      section.documentElement.appendChild(m)
                    }
                    s = m.querySelectorAll(`staff[n='${curStaff}']`)[0]
                    if (!s) {
                      s = section.createElement('staff')
                      s.setAttribute('n', variant.closest('staff').getAttribute('n'))
                      m.appendChild(s)
                    }
                    s.appendChild(variant.cloneNode(true))
                    break
                  default:
                    m = section.querySelectorAll(`measure[n='${curMeasure}']`)[0]
                    if (!m) {
                      m = section.createElement('measure')
                      m.setAttribute('n', curMeasure)
                      section.documentElement.appendChild(m)
                    }
                    // check that this is something that is on staff
                    if (variant.closest('staff')) {
                      s = m.querySelectorAll(`staff[n='${curStaff}']`)[0]
                      if (!s) {
                        s = section.createElement('staff')
                        s.setAttribute('n', variant.closest('staff').getAttribute('n'))
                        m.appendChild(s)
                      }
                      l = s.querySelectorAll(`layer[n='${curLayer}']`)[0]
                      if (!l) {
                        l = section.createElement('layer')
                        l.setAttribute('n', variant.closest('layer').getAttribute('n'))
                        s.appendChild(l)
                      }
                      l.appendChild(variant.cloneNode(true))
                    } else {
                      m.appendChild(variant.cloneNode(true))
                    }
                }

                const staff = section.querySelectorAll('staff')[0]
                const staffNumber = staff ? staff.getAttribute('n') : '1'
                if (idx === 0) {
                  scoreDef = serializer.serializeToString(getScoreDefFor(variant, staffNumber))
                }
              }

              values.push({
                scoreDef,
                eventData: serializer.serializeToString(section),
                sourceUrl: targets[0].split('#')[0],
                wit,
                isLemma
              })
            })
        )
      }
      variants.push({ group: groupId, values })
    }
    Promise.all(promises).then(() => {
      dispatch(setMusicVariants(variants))
    })
  }
}
