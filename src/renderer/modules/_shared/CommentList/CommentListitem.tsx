import { isEqual } from 'lodash';
import * as moment from 'moment';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import fallback_url from '../../../../assets/img/avatar_placeholder.jpg';
import { IMAGE_SIZES } from '../../../../common/constants';
import { SC } from '../../../../common/utils';
import { SoundCloud } from '../../../../types';
import FallbackImage from '../FallbackImage';
import Linkify from '../Linkify';

interface Props {
    comment: SoundCloud.Comment;
}

class CommentListItem extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {
        const { comment } = this.props;

        if (!isEqual(comment, nextProps.comment)) {
            return true;
        }
        return false;
    }

    render() {
        const { comment } = this.props;

        const img = SC.getImageUrl(comment.user.avatar_url, IMAGE_SIZES.XSMALL);

        return (
            <Row className='comment'>
                <div className='comment-user col-xs no-grow'>
                    <FallbackImage id={comment.user_id} width={50} height={50} src={img} fallbackImage={fallback_url} />
                </div>
                <Col xs='8' className='comment-main'>
                    <div className='info flex'>
                        <Link to={`/user/${comment.user_id}`}>
                            {comment.user.username}
                        </Link>
                        <span className='divider align-self-center' />
                        <div className='text-muted'>
                            {moment(comment.created_at, 'YYYY-MM-DD HH:mm Z').fromNow()}
                        </div>
                    </div>
                    <div className='comment-body'>
                        <Linkify text={comment.body} />
                    </div>
                </Col>
            </Row>
        );
    }
}

export default CommentListItem;
