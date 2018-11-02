import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import { IMAGE_SIZES } from '../../../../common/constants';
import { StoreState } from '../../../../common/store';
import { SC } from '../../../../common/utils';
import { NormalizedResult, SoundCloud } from '../../../../types';
import FallbackImage from '../FallbackImage';
import Linkify from '../Linkify';
import { getCommentEntity } from '../../../../common/store/entities/selectors';

const fallback_url = require('../../../../assets/img/avatar_placeholder.jpg');

interface OwnProps {
    idResult: NormalizedResult;
}

interface PropsFromState {
    comment: SoundCloud.Comment | null;
}

type AllProps = OwnProps & PropsFromState;

class CommentListItem extends React.PureComponent<AllProps> {

    render() {
        const { comment } = this.props;

        if (!comment) return null;

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

const mapStateToProps = (state: StoreState, { idResult }: OwnProps): PropsFromState => ({
    comment: getCommentEntity(idResult.id)(state)
});

export default connect<PropsFromState, {}, OwnProps, StoreState>(mapStateToProps)(CommentListItem);
