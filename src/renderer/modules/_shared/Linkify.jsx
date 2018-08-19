/* eslint-disable react/no-danger */
import autolinker from 'autolinker';
import PropTypes from 'prop-types';
import React from 'react';

const Linkify = ({ text }) => {
    if (text === null || (text && !text.length)) return null

    let tag = null;
    let a = null;

    return (
        <div>
            <div dangerouslySetInnerHTML={{
                __html: autolinker.link(text.replace(/\n/g, '</br>'), {
                    mention: 'twitter', // TODO change to souncloud
                    replaceFn: (match) => {
                        switch (match.getType()) {
                            case 'url':
                                if (/https?:\/\/(www.)?soundcloud\.com\//g.exec(match.getUrl()) !== null) {

                                    tag = match.buildTag()
                                    tag.setAttr('target', '_self')

                                    return tag
                                }

                                return true

                            case 'mention':
                                tag = match.buildTag()
                                tag.setAttr('href', `https://soundcloud.com/${match.getMention()}`)
                                tag.setAttr('target', '_self')

                                return tag

                            case 'email':
                                a = match.buildTag()

                                a.setAttr('target', '_self')

                                return a
                            default:
                                return false

                        }
                    }
                })
            }} />
        </div>
    )
}

Linkify.propTypes = {
    text: PropTypes.string
}

Linkify.defaultProps = {
    text: ""
}

export default Linkify