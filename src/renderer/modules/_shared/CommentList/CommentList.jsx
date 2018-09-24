import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactList from 'react-list';
import Spinner from '../Spinner/Spinner';
import CommentListItem from './CommentListitem';

class CommentList extends Component {

    renderItem = (index) => {
        const { comments, comment_entities, user_entities } = this.props

        const commentId = comments.items[index]

        const comment = comment_entities[commentId]
        const user = user_entities[comment.user_id]

        return (
            <CommentListItem key={`comment-${commentId}`} user={user} comment={comment} />
        )
    }

    render() {
        const { comments } = this.props

        const items = comments.items || []

        return (
            <div className="comments">
                <ReactList
                    pageSize={8}
                    type="simple"
                    length={items.length}
                    itemRenderer={this.renderItem}
                    useTranslate3d
                    threshold={400}
                />
                {(comments.isFetching) ? <Spinner /> : null}
            </div>
        )
    }
}

CommentList.propTypes = {
    comments: PropTypes.object.isRequired,
    comment_entities: PropTypes.object.isRequired,
    user_entities: PropTypes.object.isRequired
}

export default CommentList
