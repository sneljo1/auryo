import isEqual from "lodash/isEqual";
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import fallback_url from '../../../../assets/img/avatar_placeholder.jpg';
import { IMAGE_SIZES } from '../../../../shared/constants';
import { SC } from '../../../../shared/utils';
import FallbackImage from '../FallbackImage';
import Linkify from '../Linkify';
import './commentList.scss';

class CommentListItem extends React.Component {

    shouldComponentUpdate(nextProps) {
        const { comment, user } = this.props

        if (!isEqual(comment, nextProps.comment) ||
            !isEqual(user, nextProps.user)) {
            return true
        }
        return false
    }

    render() {
        const { comment, user } = this.props

        const img = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.XSMALL)

        return (
            <Row className="comment">
                <div className="comment-user col-xs no-grow">
                    <FallbackImage id={comment.user_id} width={50} height={50} src={img} fallbackImage={fallback_url} />
                </div>
                <Col xs="8" className="comment-main">
                    <div className="info flex">
                        <Link to={`/user/${comment.user_id}`}>
                            {user.username}
                        </Link>
                        <span className="divider align-self-center" />
                        <div className="text-muted">
                            {moment(comment.created_at, 'YYYY-MM-DD HH:mm Z').fromNow()}
                        </div>
                    </div>
                    <div className="comment-body">
                        <Linkify text={comment.body} />
                    </div>
                </Col>
            </Row>
        )
    }
}

CommentListItem.propTypes = {
    comment: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
}

export default CommentListItem
