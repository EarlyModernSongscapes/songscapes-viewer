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
        const sourceAndId = reading.children[0].getAttribute('target').split('#')
        promises.push(
          fetch(sourceAndId[0])
            .then(response => response.text())
            .then(text => {
              const source = parser.parseFromString(text, 'text/xml')
              const variant = source.querySelector(`[*|id="${sourceAndId[1]}"]`)
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
        const values = []
        for (const rdg of Array.from(reading.getElementsByTagName('rdg'))) {
          const wit = rdg.getAttribute('wit')
          const isLemma = wit === lemma ? true : false
          const sourceAndId = rdg.children[0].getAttribute('target').split('#')
          promises.push(
            fetch(sourceAndId[0])
              .then(response => response.text())
              .then(text => {
                const source = parser.parseFromString(text, 'text/xml')
                const variant = source.querySelector(`[*|id="${sourceAndId[1]}"]`)
                values.push({
                  text: variant.textContent,
                  sourceUrl: sourceAndId[0],
                  wit,
                  isLemma
                })
              })
          )
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
        const targets = reading.getAttribute('target').split(/\s+/)
        const meiUrl = targets[0].split('#')[0] // Get MEI url from first target; they must all point ot the same file
        promises.push(
          fetch(meiUrl)
            .then(response => response.text())
            .then(text => {
              const meisource = parser.parseFromString(text, 'text/xml')
              const variantParts = []
              let isMeasure = false
              let isMultiStaff = false
              let isStaff = false
              let isLayer = false
              let scoreDef = ''
              let staffNumber = ''

              for (const [idx, target] of targets.entries()) {
                const sourceAndId = target.split('#')
                const variant = meisource.querySelector(`[*|id="${sourceAndId[1]}"]`)
                switch (variant.tagName) {
                  case 'measure':
                    isMeasure = true
                  case 'staff':
                    if (isStaff) {
                      isMultiStaff = true
                    }
                    isStaff = true
                  case 'layer':
                    isLayer = true
                  default:
                }
                variantParts.push(variant)
                if (idx === 0) {
                  // TODO: allow measure variants: scoreDef is tied to staff at the moment.
                  if (isStaff) {
                    staffNumber = variant.getAttribute('n')
                  } else {
                    staffNumber = variant.closest('staff').getAttribute('n')
                  }
                  scoreDef = serializer.serializeToString(getScoreDefFor(variant, staffNumber))
                }
              }

              let variant = ''
              for (const v of variantParts) {
                if (isMultiStaff) {
                  variant += `<measure>${serializer.serializeToString(v)}</measure>`
                } else {
                  variant += serializer.serializeToString(v)
                }
              }

              if (isMeasure  || isMultiStaff) {
                variant = `<section>${variant}</section>`
              } else if (isStaff && !isMultiStaff) {
                variant = `<section><measure>${variant}</measure></section>`
              } else if (isLayer) {
                variant = `<section><measure><staff>${variant}</staff></measure></section>`
              } else {
                variant = `<section><measure><staff><layer>${variant}</layer></staff></measure></section>`
              }

              values.push({
                scoreDef,
                eventData: variant,
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
