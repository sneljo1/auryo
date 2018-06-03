import React from 'react'
import PropTypes from 'prop-types'
import { Col, Row } from 'reactstrap'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { SC } from '../../../../shared/utils/index'
import { IMAGE_SIZES } from '../../../../shared/constants/index'
import './commentList.scss'
import FallbackImage from '../FallbackImage'
import fallback_url from '../../../../assets/img/avatar_placeholder.jpg'
import Linkify from '../linkify.component'

class CommentListItem extends React.PureComponent {

    static propTypes = {
        comment: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired
    }

    render() {
        const { comment, user } = this.props

        const img = SC.getImageUrl(user.avatar_url, IMAGE_SIZES.XSMALL)

        return (
            <Row className="comment">
                <div className="comment-user col-xs no-grow">
                    <FallbackImage width={50} height={50} src={img} fallbackImage={fallback_url} />
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

export default CommentListItem
