import fallbackAvatar from '@assets/img/avatar_placeholder.jpg';
import { IMAGE_SIZES } from '@common/constants';
import { getCommentEntity } from '@common/store/entities/selectors';
import { SC } from '@common/utils';
import { Normalized } from '@types';
import moment from 'moment';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';
import FallbackImage from '../../FallbackImage';
import { Linkify } from '../../Linkify';
import './CommentListItem.scss';

interface Props {
  idResult: Normalized.NormalizedResult;
}

const CommentListItem: FC<Props> = ({ idResult }) => {
  const comment = useSelector(getCommentEntity(idResult.id));

  if (!comment) {
    return null;
  }

  const img = SC.getImageUrl(comment.user.avatar_url, IMAGE_SIZES.XSMALL);

  return (
    <Row className="comment">
      <div className="comment-user col-xs no-grow">
        <FallbackImage src={img} width={50} height={50} fallbackImage={fallbackAvatar} />
      </div>
      <Col xs="8" className="comment-main">
        <div className="info flex">
          <Link to={`/user/${comment.user_id}`}>{comment.user.username}</Link>
          <span className="divider align-self-center" />
          <div className="text-muted">{moment(comment.created_at, 'YYYY-MM-DD HH:mm Z').fromNow()}</div>
        </div>
        <div className="comment-body">
          <Linkify text={comment.body} />
        </div>
      </Col>
    </Row>
  );
};

export default CommentListItem;
