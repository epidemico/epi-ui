// @flow
import { Meteor } from 'meteor/meteor'
import React, { Component } from 'react'
import update from 'immutability-helper'

import InputTags from '/imports/epi-ui/InputTags'
import { handleSuggestionFilter } from '/imports/utils'
import { errlog } from '/imports/fui'

export const generateFilterHandler = (
  target: string = 'topics',
  options?: Object = { noPath: true },
  store?: Object
) => handleSuggestionFilter.bind(store || AutoSuggestBox.store, target, options)

const createStore = () => ({
  tagsTreeMap: {},
  idToPath: {},
})

const piiStore = createStore()

type PropTypes = {
  autocomplete: boolean,
  changeById: boolean,
  classNames: Object,
  delimeters: Array<number>,
  handleFilterSuggestions: Function,
  idLookup: Object,
  ids: Array<string>,
  idsToTagMethod: string,
  idsToTags: boolean,
  idsToTerm: Object,
  maxTags?: number,
  minQueryLength: number,
  name: string,
  onChange: Function,
  placeholder?: string,
  store?: Object,
  suggestions: Array<string>,
  tags: Array<Object>,
  tagsBelow: boolean,
}

type StateTypes = {
  tags: Array<Object>,
  idsToTerm: Object,
}

export class AutoSuggestBox extends Component<PropTypes, StateTypes> {
  static store = createStore()
  static createStore = createStore

  static defaultProps = {
    autocomplete: true,
    changeById: true,
    classNames: { inputElement: 'form-control form-group' },
    delimeters: [13],
    idLookup: {},
    ids: [],
    idsToTags: false,
    idsToTagMethod: 'epione.idsToTerm',
    idsToTerm: {},
    minQueryLength: 0,
    onChange: () => {},
    suggestions: [],
    tags: [],
    tagsBelow: false,
  }

  willUnmount = false

  state = {
    tags: [],
    idsToTerm: {},
  }

  componentWillMount(args: ?PropTypes) {
    const opts = args || this.props
    this.resetState(opts)
    this.fetchTags(opts)
  }

  componentWillReceiveProps(props: PropTypes) {
    if (
      (props.idsToTags && JSON.stringify(props.ids) != JSON.stringify(this.props.ids)) ||
      (!props.idsToTags && JSON.stringify(props.tags) != JSON.stringify(this.props.tags))
    ) {
      this.componentWillMount(props)
    }
  }

  componentWillUnmount() {
    this.willUnmount = true
  }

  resetState(props: PropTypes) {
    if (this.willUnmount) return
    this.setState(() => ({
      tags: (props && props.tags && props.tags.concat()) || [],
      idsToTerm: Object.assign({}, props.idsToTerm),
    }))
  }

  fetchTags(props: PropTypes) {
    const { idsToTagMethod, idsToTags, ids, idLookup, store } = props
    if (idsToTags) {
      if (ids.length) {
        Meteor.call(idsToTagMethod, ids, (error, idsToTerm) => {
          const tags =
            ids &&
            ids.map(idStr => {
              const id = +idStr
              const text =
                (store || AutoSuggestBox.store).idToPath[id] || idLookup[id] || idsToTerm[id]
              if (text) {
                return {
                  id,
                  text,
                  isValid: true,
                }
              }
              errlog(`Tag with id ${id} could not be looked up`)
              return {
                id,
                text: `Unknown-tag-ID-${id}`,
                isValid: false,
              }
            })
          if (this.willUnmount) return
          this.setState(() => ({ tags, idsToTerm }))
        })
      } else {
        this.resetState(props)
      }
    }
  }

  handleOnChange = () => {
    const { changeById, name, idLookup, onChange, store } = this.props
    const { tags, idsToTerm } = this.state
    let value
    if (changeById) {
      value = tags.map(tag => {
        try {
          return (store || AutoSuggestBox.store).tagsTreeMap[tag.text].id
        } catch (e) {
          console.warn('Tag not found by text in tagsTreeMap:', tag.text)
        }
        const id = tag.id
        if (idLookup[id] || (store || AutoSuggestBox.store).idToPath[id] || idsToTerm[id]) {
          return id
        } else {
          errlog('Tag not found by id:', id)
        }
      })
    } else {
      value = tags.map(tag => tag.text)
    }
    onChange(null, {
      name,
      value,
    })
  }

  handleDelete = (index: number) => {
    if (typeof index === 'undefined') return
    this.setState(
      state => ({
        tags: update(state.tags, {
          $splice: [[index, 1]],
        }),
      }),
      this.handleOnChange
    )
  }

  handleAddition = (tag: string) => {
    if (this._hasReachedMaxTags()) return
    if (tag && this.state.tags.findIndex(t => t.text === tag) === -1) {
      this.setState(
        state => ({
          tags: update(state.tags, {
            $push: [
              {
                id: 'tag-' + Math.random(),
                text: tag,
                isValid: true,
              },
            ],
          }),
        }),
        this.handleOnChange
      )
    }
  }

  _hasReachedMaxTags = () => {
    const { maxTags } = this.props
    const { tags } = this.state
    return !!(maxTags && tags.filter(tag => !!tag.isValid).length >= maxTags)
  }

  render() {
    const {
      autocomplete,
      classNames,
      delimeters,
      handleFilterSuggestions,
      maxTags,
      minQueryLength,
      placeholder,
      suggestions,
      tagsBelow,
    } = this.props

    const { tags } = this.state

    return (
      <InputTags
        handleAddition={this.handleAddition}
        handleDelete={this.handleDelete}
        autofocus={false}
        disabled={this._hasReachedMaxTags()}
        {...{
          autocomplete,
          classNames,
          delimeters,
          handleFilterSuggestions,
          minQueryLength,
          placeholder,
          suggestions,
          tags,
          tagsBelow,
        }}
      />
    )
  }
}

type FieldPropTypes = {
  classNames?: Object,
  ids?: Array<string>,
  onChange: Function,
  tagsBelow?: boolean,
}

export const ArrayOfStrings = (props: Object) => (
  <AutoSuggestBox {...props} autocomplete={false} changeById={false} minQueryLength={0} />
)
export const ArrayOfIntegers = (props: Object) => (
  <ArrayOfStrings
    pattern="[0-9,]*"
    tags={props.value && props.value.map(value => ({ isValid: true, id: value, text: value }))}
    {...props}
  />
)
export const BusinessCategories = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="business_categories"
    placeholder="Business categories"
    handleFilterSuggestions={generateFilterHandler('business categories')}
    {...props}
  />
)
export const Diseases = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="disease"
    placeholder="Diseases"
    handleFilterSuggestions={generateFilterHandler('disease')}
    {...props}
  />
)
export const EventContext = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="event_context"
    placeholder="Event Contexts"
    handleFilterSuggestions={generateFilterHandler('event context')}
    {...props}
  />
)
export const Organizations = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="organizations"
    placeholder="Organizations"
    handleFilterSuggestions={generateFilterHandler('organizations')}
    {...props}
  />
)
export const PII = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    idsToTagMethod="curation.piiIdsToTerm"
    store={piiStore}
    name="pii"
    placeholder="PII"
    handleFilterSuggestions={generateFilterHandler(
      'pii',
      {
        noPath: true,
        methodName: 'curation.searchPII',
        sortBy: s => s.length,
      },
      piiStore
    )}
    {...props}
  />
)
export const Products = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="products"
    placeholder="Products"
    handleFilterSuggestions={generateFilterHandler('products')}
    {...props}
  />
)
export const Species = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="species"
    placeholder="Species"
    handleFilterSuggestions={generateFilterHandler('species')}
    {...props}
  />
)
export const Symptoms = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="symptoms"
    placeholder="Symptoms"
    handleFilterSuggestions={generateFilterHandler('symptoms')}
    {...props}
  />
)
export const Topics = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="topics"
    placeholder="Products, symptoms, diseases, topics"
    handleFilterSuggestions={generateFilterHandler()}
    {...props}
  />
)
export const VaccineSentiment = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="vaccine_sentiment"
    placeholder="Vaccine sentiment"
    handleFilterSuggestions={generateFilterHandler('vaccine_sentiment')}
    {...props}
  />
)
export const UserExperience = (props: FieldPropTypes) => (
  <AutoSuggestBox
    idsToTags
    name="user_experience"
    placeholder="User experience"
    handleFilterSuggestions={generateFilterHandler('user experience')}
    {...props}
  />
)

export default {
  AutoSuggestBox,
  BusinessCategories,
  Diseases,
  Organizations,
  PII,
  Products,
  Symptoms,
  Topics,
  UserExperience,
}
