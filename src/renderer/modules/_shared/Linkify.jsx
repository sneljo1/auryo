import React from 'react'
import PropTypes from 'prop-types'
import autolinker from 'autolinker'

class Linkify extends React.PureComponent {

    static propTypes = {
        text: PropTypes.string
    }

    render() {
        const { text } = this.props

        if (text === null || (text && !text.length)) return null

        return (
            <div>
                <div dangerouslySetInnerHTML={{
                    __html: autolinker.link((text ? text : ' ').replace(/\n/g, '</br>'), {
                        mention: 'twitter',
                        replaceFn: (match) => {
                            switch (match.getType()) {
                                case 'url':
                                    if (/https?:\/\/(www.)?soundcloud\.com\//g.exec(match.getUrl()) !== null) {

                                        let tag = match.buildTag()
                                        tag.setAttr('target', '_self')

                                        return tag
                                    }

                                    return true

                                case 'mention':
                                    let tag = match.buildTag()
                                    tag.setAttr('href', 'https://soundcloud.com/' + match.getMention())
                                    tag.setAttr('target', '_self')

                                    return tag
                                default:
                                    return false

                            }
                        }
                    })
                }} />
            </div>
        )
    }
}

export default Linkify