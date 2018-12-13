import React, { Fragment } from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'
import rehypeReact from 'rehype-react'
import { navigate, Link } from 'gatsby'

import Layout from './Layout'

import getNamedPartials from '../partials'
import CoursePageFooter from '../components/CoursePageFooter'
import { getCachedUserDetails } from '../services/moocfi'
import './remark.css'
import PagesContext from '../contexes/PagesContext'
import LoginStateContext, {
  LoginStateContextProvider,
} from '../contexes/LoginStateContext'
import Container from '../components/Container'

import { loggedIn } from '../services/moocfi'
import { capitalizeFirstLetter } from '../util/strings'

const ContentWrapper = styled.div`
  margin-top: 1rem;
`

const SectionIndicator = styled(Link)`
  display: block;
  color: #333 !important;
`

export default class CourseContentTemplate extends React.Component {
  static contextType = LoginStateContext

  async componentDidMount() {
    if (!loggedIn()) {
      return
    }

    let userInfo = await getCachedUserDetails()
    const research = userInfo?.extra_fields?.research
    if (research === undefined) {
      navigate('/missing-info')
    }
  }

  render() {
    const { data } = this.props
    const { frontmatter, htmlAst } = data.page
    const allPages = data.allPages.edges.map(o => o.node?.frontmatter)
    const partials = getNamedPartials()
    const renderAst = new rehypeReact({
      createElement: React.createElement,
      components: partials,
    }).Compiler

    const parentSectionName = capitalizeFirstLetter(
      `${frontmatter.path.split(/\//g)[1].replace(/-/g, ' ')}:`
    )
    const parentSectionPath = `/${frontmatter.path.split(/\//g)[1]}`
    return (
      <PagesContext.Provider
        value={{
          all: allPages,
          current: frontmatter,
        }}
      >
        <LoginStateContextProvider>
          <Layout>
            <Fragment>
              <Container>
                <ContentWrapper>
                  <SectionIndicator className="h3" to={parentSectionPath}>
                    {parentSectionName}
                  </SectionIndicator>
                  <h1>{frontmatter.title}</h1>
                  {renderAst(htmlAst)}
                </ContentWrapper>
              </Container>
              <CoursePageFooter />
            </Fragment>
          </Layout>
        </LoginStateContextProvider>
      </PagesContext.Provider>
    )
  }
}

export const pageQuery = graphql`
  query($path: String!) {
    page: markdownRemark(frontmatter: { path: { eq: $path } }) {
      htmlAst
      html
      frontmatter {
        path
        title
      }
    }
    allPages: allMarkdownRemark {
      edges {
        node {
          id
          frontmatter {
            path
            title
          }
        }
      }
    }
  }
`
